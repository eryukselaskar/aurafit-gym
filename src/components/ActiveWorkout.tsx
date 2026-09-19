import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Clock, Plus, ArrowRight, Play, Pause, FileText, Trophy } from 'lucide-react';
import type { WorkoutProgram, WorkoutExercise, CompletedWorkout, WorkoutSet, PersonalRecord } from '../types';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { resolveSetTarget } from '../utils/repTarget';
import { calculatePersonalRecords } from '../utils/personalRecords';
import { RestTimerPanel } from './RestTimerPanel';
import { now } from '../utils/id';
import './ActiveWorkout.css';
import {
  startWorkoutService,
  stopWorkoutService,
  pauseWorkoutService,
  resumeWorkoutService,
  updateWorkoutService,
  addWorkoutServiceListener
} from '../utils/workoutService';

interface ActiveWorkoutProps {
  activeProgram: WorkoutProgram;
  finishWorkout: (completed: CompletedWorkout, newPRs: PersonalRecord[]) => void;
  cancelWorkout: () => void;
  personalRecords: PersonalRecord[];
  history: CompletedWorkout[];
}

// Programın egzersizlerini yeni bir seans için sıfırlar (girilen değerler ve
// tamamlanma işaretleri temizlenir).
const freshExercises = (program: WorkoutProgram): WorkoutExercise[] =>
  program.exercises.map(ex => ({
    ...ex,
    sets: ex.sets.map(s => ({
      ...s,
      actualReps: undefined,
      actualWeight: undefined,
      actualRir: undefined,
      completed: false
    }))
  }));

// Kaydedilmiş aktif antrenman durumunu okur. Bileşen state'ine bağlı olmadığı için
// modül kapsamındadır; böylece useState başlatıcıları güvenle çağırabilir.
const getSavedWorkoutState = () => {
  try {
    const saved = localStorage.getItem('aurafit_workout_active_state');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to parse saved active workout state:", e);
  }
  return null;
};

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  activeProgram,
  finishWorkout,
  cancelWorkout,
  personalRecords,
  history
}) => {
  // --- State ---
  const [timerStartTime, setTimerStartTime] = useState<number>(() => {
    const saved = getSavedWorkoutState();
    if (saved && saved.activeProgram?.id === activeProgram.id) {
      return saved.workoutStartTime || Date.now();
    }
    return Date.now();
  });

  const [accumulatedSeconds, setAccumulatedSeconds] = useState<number>(() => {
    const saved = getSavedWorkoutState();
    if (saved && saved.activeProgram?.id === activeProgram.id) {
      return saved.accumulatedTime || 0;
    }
    return 0;
  });

  // Main workout timer
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    const saved = getSavedWorkoutState();
    if (saved && saved.activeProgram?.id === activeProgram.id) {
      if (saved.isTimerRunning) {
        const diff = Math.floor((Date.now() - saved.workoutStartTime) / 1000);
        return (saved.accumulatedTime || 0) + Math.max(0, diff);
      } else {
        return saved.accumulatedTime || 0;
      }
    }
    return 0;
  });

  const [exercises, setExercises] = useState<WorkoutExercise[]>(() => {
    const saved = getSavedWorkoutState();
    if (saved && saved.exercises && saved.exercises.length > 0 && saved.activeProgram?.id === activeProgram.id) {
      return saved.exercises;
    }
    // Yeni seans: programın setlerini sıfırlanmış halde başlat. (Önceden bu
    // mount effect'i içinde setExercises ile yapılıyor, fazladan render'a yol
    // açıyordu.)
    return freshExercises(activeProgram);
  });

  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(() => {
    const saved = getSavedWorkoutState();
    if (saved && saved.activeProgram?.id === activeProgram.id) {
      return saved.isTimerRunning !== undefined ? saved.isTimerRunning : true;
    }
    return true;
  });

  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs to avoid stale closures in listeners
  const handleFinishWorkoutRef = useRef<(() => void) | null>(null);
  const skipRestRef = useRef<(() => void) | null>(null);

  const [showCelebration, setShowCelebration] = useState(false);
  const [newPRs, setNewPRs] = useState<PersonalRecord[]>([]);
  const [completedWorkoutData, setCompletedWorkoutData] = useState<CompletedWorkout | null>(null);
  const [workoutNote, setWorkoutNote] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);

  // Mobile set slider picker state
  const [activeSetEdit, setActiveSetEdit] = useState<{ exIdx: number; setIdx: number } | null>(null);

  // Rest timer states
  const [isResting, setIsResting] = useState<boolean>(() => {
    const saved = getSavedWorkoutState();
    if (saved && saved.activeProgram?.id === activeProgram.id) {
      return saved.isResting || false;
    }
    return false;
  });
  const [restDuration, setRestDuration] = useState<number>(() => {
    const saved = getSavedWorkoutState();
    if (saved && saved.activeProgram?.id === activeProgram.id) {
      return saved.restDuration || 60;
    }
    return 60;
  });
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(() => {
    const saved = getSavedWorkoutState();
    if (saved && saved.activeProgram?.id === activeProgram.id && saved.isResting) {
      const elapsedRest = Math.floor((Date.now() - (saved.restStartTime || Date.now())) / 1000);
      return Math.max(0, (saved.restSecondsLeft || 0) - elapsedRest);
    }
    return 0;
  });
  const [restStartTime, setRestStartTime] = useState<number | null>(() => {
    const saved = getSavedWorkoutState();
    if (saved && saved.activeProgram?.id === activeProgram.id) {
      return saved.restStartTime || null;
    }
    return null;
  });
  const [currentRestExercise, setCurrentRestExercise] = useState<string>(() => {
    const saved = getSavedWorkoutState();
    if (saved && saved.activeProgram?.id === activeProgram.id) {
      return saved.currentRestExercise || '';
    }
    return '';
  });
  
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Yardımcılar ---
  const scheduleRestNotification = async (seconds: number, nextExName: string) => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }
      // Cancel previous notification if any
      await LocalNotifications.cancel({ notifications: [{ id: 42 }] });
      
      // Schedule new one
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Dinlenme Süresi Bitti! 🏋️‍♂️",
            body: `Sıradaki hareket: ${nextExName}`,
            id: 42,
            schedule: { at: new Date(now() + seconds * 1000) },
            sound: undefined
          }
        ]
      });
    } catch (e) {
      console.warn("LocalNotifications failed to schedule:", e);
    }
  };

  const cancelRestNotification = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await LocalNotifications.cancel({ notifications: [{ id: 42 }] });
    } catch (e) {
      console.warn("LocalNotifications failed to cancel:", e);
    }
  };

  // Helper to save active workout state to localStorage
  // Not: tüm çağrılar ilk yedi argümanı açıkça geçer. Daha önce burada bulunan
  // varsayılan değerler bileşenin ~400 satır aşağısında tanımlanan state'lere
  // bakıyordu (TDZ riski) ve hiçbir zaman değerlendirilmiyordu; kaldırıldı.
  const saveWorkoutState = (
    currentExercises: WorkoutExercise[],
    running: boolean,
    currentElapsed: number,
    resting: boolean,
    restLeft: number,
    restDur: number,
    restEx: string,
    customStartTime?: number,
    customAccumulated?: number,
    customRestStartTime?: number | null
  ) => {
    try {
      const saved = getSavedWorkoutState();
      const startTime = customStartTime !== undefined ? customStartTime : timerStartTime;
      const accumulated = customAccumulated !== undefined ? customAccumulated : accumulatedSeconds;
      const restStart = customRestStartTime !== undefined ? customRestStartTime : (resting ? (saved?.restStartTime || Date.now()) : null);
      void currentElapsed;

      const state = {
        activeProgram,
        exercises: currentExercises,
        isTimerRunning: running,
        workoutStartTime: startTime,
        accumulatedTime: accumulated,
        isResting: resting,
        restDuration: restDur,
        restSecondsLeft: restLeft,
        restStartTime: restStart,
        currentRestExercise: restEx
      };
      localStorage.setItem('aurafit_workout_active_state', JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save active workout state:", e);
    }
  };





  // Initialize program copy with actual fields filled OR restore saved state
  // Aşağıdaki yardımcılar effect'lerden çağrıldığı için onlardan önce tanımlanır.
  // Helper to construct dynamic progress string for notification
  const getProgressString = (currentExercises: WorkoutExercise[]) => {
    const total = currentExercises.length;
    const completed = currentExercises.filter(ex => ex.sets.every(s => s.completed)).length;
    const activeEx = currentExercises.find(ex => !ex.sets.every(s => s.completed)) || currentExercises[total - 1];
    const activeName = activeEx ? activeEx.name : '';
    return {
      title: `${completed}/${total} Egzersiz • ${activeName}`,
      progressText: `${completed}/${total} Egzersiz Tamamlandı`
    };
  };

  // Sync React state updates to Background Notification
  const syncWithBackgroundService = (
    currentExercises = exercises,
    resting = isResting,
    secondsLeft = restSecondsLeft
  ) => {
    if (currentExercises.length === 0) return;
    const { title } = getProgressString(currentExercises);
    updateWorkoutService(title, resting, secondsLeft);
  };

  // Synthesize dynamic chime when rest finishes using Web Audio API
  const playSynthesizedChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const playTone = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      };

      // Play a beautiful 3-tone ascending arpeggio (C5 -> E5 -> G5)
      const now = ctx.currentTime;
      playTone(523.25, now, 0.2);       // C5
      playTone(659.25, now + 0.15, 0.25);  // E5
      playTone(783.99, now + 0.3, 0.45);   // G5
    } catch (e) {
      console.warn("AudioContext failed to play sound due to user interaction restrictions:", e);
    }
  };

  const handleRestComplete = () => {
    setIsResting(false);
    setRestStartTime(null);
    playSynthesizedChime();
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]); // Short dynamic vibration
    }
    cancelRestNotification();
    syncWithBackgroundService(exercises, false, 0);
    saveWorkoutState(exercises, isTimerRunning, elapsedSeconds, false, 0, restDuration, currentRestExercise, undefined, undefined, null);
  };

  useEffect(() => {
    const saved = getSavedWorkoutState();

    if (saved && saved.activeProgram?.id === activeProgram.id && saved.exercises && saved.exercises.length > 0) {
      const initialElapsed = saved.isTimerRunning
        ? (saved.accumulatedTime || 0) + Math.max(0, Math.floor((now() - saved.workoutStartTime) / 1000))
        : (saved.accumulatedTime || 0);
      
      startWorkoutService(activeProgram.name, initialElapsed);
      if (!saved.isTimerRunning) {
        pauseWorkoutService();
      }
    } else {
      const initialized = freshExercises(activeProgram);
      startWorkoutService(activeProgram.name, 0);
      
      try {
        const state = {
          activeProgram,
          exercises: initialized,
          isTimerRunning: true,
          workoutStartTime: Date.now(),
          accumulatedTime: 0,
          isResting: false,
          restDuration: 60,
          restSecondsLeft: 0,
          restStartTime: null,
          currentRestExercise: ''
        };
        localStorage.setItem('aurafit_workout_active_state', JSON.stringify(state));
      } catch { /* localStorage erişilemiyor; oturum durumu kaydedilemedi */ }
    }

    setTimeout(() => {
      const currentSaved = getSavedWorkoutState();
      if (currentSaved && currentSaved.activeProgram?.id === activeProgram.id && currentSaved.isResting) {
        const elapsedRest = Math.floor((Date.now() - (currentSaved.restStartTime || Date.now())) / 1000);
        const restLeft = Math.max(0, (currentSaved.restSecondsLeft || 0) - elapsedRest);
        if (restLeft > 0) {
          updateWorkoutService(getProgressString(exercises).title, true, restLeft);
        } else {
          updateWorkoutService(getProgressString(exercises).title, false, 0);
        }
      } else {
        syncWithBackgroundService();
      }
    }, 300);

    const listener = addWorkoutServiceListener((data) => {
      if (data.action === 'pause') {
        setIsTimerRunning(false);
      } else if (data.action === 'resume') {
        setIsTimerRunning(true);
      } else if (data.action === 'finish') {
        setTimeout(() => {
          if (handleFinishWorkoutRef.current) {
            handleFinishWorkoutRef.current();
          }
        }, 100);
      } else if (data.action === 'skipRest') {
        if (skipRestRef.current) {
          skipRestRef.current();
        }
      }
    });

    return () => {
      stopWorkoutService();
      if (listener) {
        try {
          listener.remove();
        } catch (e) {
          console.error("Failed to remove workout service listener:", e);
        }
      }
    };
    // Kasıtlı: yalnızca program değiştiğinde yeniden kurulur. Diğer değerler
    // effect içinde okunduğunda güncel halleri zaten localStorage'dan alınır.
  }, [activeProgram]);

  // Main React-side timer clock
  useEffect(() => {
    if (isTimerRunning) {
      const syncTime = () => {
        const diff = Math.floor((Date.now() - timerStartTime) / 1000);
        setElapsedSeconds(accumulatedSeconds + Math.max(0, diff));
      };
      syncTime();
      timerIntervalRef.current = setInterval(syncTime, 1000);
    } else {
      // Duraklatıldığında ayrıca setElapsedSeconds(accumulatedSeconds) çağrılırdı;
      // gereksizdi. toggleTimer duraklatırken accumulatedSeconds'ı elapsedSeconds'a
      // eşitliyor, kayıtlı seans geri yüklenirken de başlatıcı aynı değeri veriyor.
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timerStartTime, accumulatedSeconds]);

  // Listen for visibility change to re-sync the timer instantly
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isTimerRunning) {
        const diff = Math.floor((Date.now() - timerStartTime) / 1000);
        setElapsedSeconds(accumulatedSeconds + Math.max(0, diff));
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTimerRunning, timerStartTime, accumulatedSeconds]);



  // Egzersiz listesi her değiştiğinde durumu diske ve arka plan servisine yaz.
  // Kasıtlı olarak yalnızca `exercises` dinlenir: tetikleyici odur, diğer
  // değerler yazılacak anlık görüntünün parçasıdır. Hepsini bağımlılığa eklemek
  // her saniye (sayaç ilerledikçe) gereksiz yazma yapardı.
  useEffect(() => {
    if (exercises.length === 0) return;
    syncWithBackgroundService(exercises, isResting, restSecondsLeft);
    saveWorkoutState(exercises, isTimerRunning, elapsedSeconds, isResting, restSecondsLeft, restDuration, currentRestExercise);
  }, [exercises]);

  const toggleTimer = () => {
    setIsTimerRunning(prev => {
      const next = !prev;
      if (next) {
        const now = Date.now();
        setTimerStartTime(now);
        resumeWorkoutService(elapsedSeconds);
        saveWorkoutState(exercises, true, elapsedSeconds, isResting, restSecondsLeft, restDuration, currentRestExercise, now, elapsedSeconds);
      } else {
        pauseWorkoutService();
        setAccumulatedSeconds(elapsedSeconds);
        saveWorkoutState(exercises, false, elapsedSeconds, isResting, restSecondsLeft, restDuration, currentRestExercise, timerStartTime, elapsedSeconds);
      }
      return next;
    });
  };


  const getLastSetPerformed = (exerciseId: string, setIdx: number) => {
    const lastSession = [...history].reverse().find(w =>
      w.exercises.some(we => we.exerciseId === exerciseId)
    );
    const lastEx = lastSession?.exercises.find(we => we.exerciseId === exerciseId);
    return lastEx?.sets[setIdx] ?? null;
  };

  const getExerciseVolumeHistory = (exerciseId: string) => {
    const data: { date: string; volume: number; maxWeight: number }[] = [];
    const chronologicalHistory = [...history].reverse();
    
    chronologicalHistory.forEach(workout => {
      const workoutEx = workout.exercises.find(ex => ex.exerciseId === exerciseId);
      if (workoutEx) {
        let exerciseVolume = 0;
        let maxWeight = 0;
        workoutEx.sets.forEach(s => {
          const reps = s.actualReps ?? s.reps;
          const weight = s.actualWeight ?? s.weight;
          if (s.completed) {
            exerciseVolume += reps * weight;
            if (weight > maxWeight) maxWeight = weight;
          }
        });
        if (exerciseVolume > 0) {
          data.push({
            date: workout.date,
            volume: exerciseVolume,
            maxWeight
          });
        }
      }
    });
    
    return data;
  };

  const renderSparkline = (exerciseId: string) => {
    const volHistory = getExerciseVolumeHistory(exerciseId);
    if (volHistory.length < 2) {
      if (volHistory.length === 1) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Tek Seans: {volHistory[0].volume} kg
            </span>
          </div>
        );
      }
      return <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Yeni Egzersiz</span>;
    }

    const last5 = volHistory.slice(-5);
    const volumes = last5.map(v => v.volume);
    const max = Math.max(...volumes);
    const min = Math.min(...volumes);
    const range = max - min || 1;

    const width = 60;
    const height = 16;
    const padding = 2;

    const points = last5.map((v, i) => {
      const x = padding + (i / (last5.length - 1)) * (width - padding * 2);
      const y = padding + (height - padding * 2) - ((v.volume - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    const isUp = volumes[volumes.length - 1] >= volumes[0];

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: isUp ? 'var(--accent-mint)' : 'var(--accent-pink)' }}>
            Hacim: {volumes[volumes.length - 1]} kg {isUp ? '↗' : '↘'}
          </span>
          <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>
            Önceki: {volumes[volumes.length - 2]} kg
          </span>
        </div>
        <svg width={width} height={height} style={{ overflow: 'visible' }}>
          <polyline
            fill="none"
            stroke={isUp ? 'var(--accent-mint)' : 'var(--accent-pink)'}
            strokeWidth="2"
            points={points}
          />
          {last5.map((v, idx) => {
            const x = padding + (idx / (last5.length - 1)) * (width - padding * 2);
            const y = padding + (height - padding * 2) - ((v.volume - min) / range) * (height - padding * 2);
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="1.5"
                fill={idx === last5.length - 1 ? 'var(--text-primary)' : (isUp ? 'var(--accent-mint)' : 'var(--accent-pink)')}
              />
            );
          })}
        </svg>
      </div>
    );
  };
  

  useEffect(() => {
    if (activeSetEdit) {
      document.body.classList.add('bottom-sheet-open');
    } else {
      document.body.classList.remove('bottom-sheet-open');
    }
    return () => {
      document.body.classList.remove('bottom-sheet-open');
    };
  }, [activeSetEdit]);


  useEffect(() => {
    if (isResting && restStartTime) {
      const syncRest = () => {
        const elapsed = Math.floor((Date.now() - restStartTime) / 1000);
        const remaining = restDuration - elapsed;
        if (remaining <= 0) {
          setRestSecondsLeft(0);
          handleRestComplete();
        } else {
          setRestSecondsLeft(remaining);
        }
      };

      syncRest();
      restIntervalRef.current = setInterval(syncRest, 1000);
    }

    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
    // Kasıtlı: sayaç yalnızca dinlenme başlayıp bittiğinde kurulur/yıkılır.
    // handleRestComplete'i bağımlılığa eklemek her render'da sayacı sıfırlardı.
  }, [isResting, restStartTime, restDuration]);



  // Rest Controls
  const skipRest = () => {
    setIsResting(false);
    setRestStartTime(null);
    setRestSecondsLeft(0);
    cancelRestNotification();
    syncWithBackgroundService(exercises, false, 0);
    saveWorkoutState(exercises, isTimerRunning, elapsedSeconds, false, 0, restDuration, currentRestExercise, undefined, undefined, null);
  };

  const changeRestDuration = (sec: number) => {
    const startedAt = now();
    setRestDuration(sec);
    setRestStartTime(startedAt);
    setRestSecondsLeft(sec);
    scheduleRestNotification(sec, currentRestExercise || "Sıradaki Egzersiz");
    syncWithBackgroundService(exercises, isResting, sec);
    saveWorkoutState(exercises, isTimerRunning, elapsedSeconds, isResting, sec, sec, currentRestExercise, undefined, undefined, startedAt);
  };

  // Active set toggle
  const toggleSetComplete = (exIdx: number, setIdx: number) => {
    const updated = exercises.map((ex, eIdx) => {
      if (eIdx !== exIdx) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s, sIdx) => {
          if (sIdx !== setIdx) return s;
          return { ...s, completed: !s.completed };
        })
      };
    });
    setExercises(updated);

    const targetEx = updated[exIdx];
    const targetSet = targetEx.sets[setIdx];
    const nextCompleted = targetSet.completed;

    // If set is completed, launch rest timer
    if (nextCompleted) {
      // Clean previous rest
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      
      const now = Date.now();
      setCurrentRestExercise(targetEx.name);
      setRestDuration(targetEx.restTime);
      setRestStartTime(now);
      setRestSecondsLeft(targetEx.restTime);
      setIsResting(true);
      scheduleRestNotification(targetEx.restTime, targetEx.name);

      syncWithBackgroundService(updated, true, targetEx.restTime);
      saveWorkoutState(updated, isTimerRunning, elapsedSeconds, true, targetEx.restTime, targetEx.restTime, targetEx.name, undefined, undefined, now);
    } else {
      setIsResting(false);
      setRestStartTime(null);
      setRestSecondsLeft(0);
      cancelRestNotification();
      syncWithBackgroundService(updated, false, 0);
      saveWorkoutState(updated, isTimerRunning, elapsedSeconds, false, 0, restDuration, currentRestExercise, undefined, undefined, null);
    }
  };

  const handleActualChange = (
    exIdx: number,
    setIdx: number,
    field: 'actualReps' | 'actualWeight' | 'actualRir',
    value: number
  ) => {
    const updated = exercises.map((ex, eIdx) => {
      if (eIdx !== exIdx) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s, sIdx) => {
          if (sIdx !== setIdx) return s;
          return { ...s, [field]: value };
        })
      };
    });
    setExercises(updated);
    if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    saveDebounceRef.current = setTimeout(() => {
      saveWorkoutState(updated, isTimerRunning, elapsedSeconds, isResting, restSecondsLeft, restDuration, currentRestExercise);
    }, 500);
  };

  const handleRemoveSetDuringWorkout = (exIdx: number, setIdx: number) => {
    const updated = exercises.map((ex, eIdx) => {
      if (eIdx !== exIdx) return ex;
      if (ex.sets.length <= 1) return ex; // en az 1 set kalmalı
      return { ...ex, sets: ex.sets.filter((_, sIdx) => sIdx !== setIdx) };
    });
    setExercises(updated);
    saveWorkoutState(updated, isTimerRunning, elapsedSeconds, isResting, restSecondsLeft, restDuration, currentRestExercise);
  };

  const handleAddSetDuringWorkout = (exIdx: number) => {
    const updated = exercises.map((ex, eIdx) => {
      if (eIdx !== exIdx) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      
      const newSet: WorkoutSet = {
        id: `active-s-${Date.now()}-${Math.random()}`,
        reps: lastSet ? lastSet.reps : 10,
        weight: lastSet ? lastSet.weight : 20,
        rir: lastSet ? (lastSet.rir !== undefined ? lastSet.rir : 2) : 2,
        completed: false,
        actualReps: lastSet ? lastSet.actualReps : 10,
        actualWeight: lastSet ? lastSet.actualWeight : 20,
        actualRir: lastSet ? (lastSet.actualRir !== undefined ? lastSet.actualRir : 2) : 2
      };
      return {
        ...ex,
        sets: [...ex.sets, newSet]
      };
    });
    setExercises(updated);
    saveWorkoutState(updated, isTimerRunning, elapsedSeconds, isResting, restSecondsLeft, restDuration, currentRestExercise);
  };

  const handleFinishWorkout = () => {
    const completedSetsCount = exercises.reduce((count, ex) =>
      count + ex.sets.filter(s => s.completed).length, 0
    );

    if (completedSetsCount === 0) {
      setConfirmModal({
        message: 'Hiçbir seti tamamlamadınız. Antrenmanı yine de bitirmek istiyor musunuz?',
        onConfirm: () => { setConfirmModal(null); doFinishWorkout(); }
      });
      return;
    }
    doFinishWorkout();
  };

  const doFinishWorkout = () => {
    cancelRestNotification();

    // Calculate volume: only count completed sets
    let totalVolume = 0;
    exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed) {
          const reps = s.actualReps ?? s.reps;
          const weight = s.actualWeight ?? s.weight;
          totalVolume += reps * weight;
        }
      });
    });

    const completed: CompletedWorkout = {
      id: `comp-${Date.now()}`,
      programId: activeProgram.id,
      programName: activeProgram.name,
      date: new Date().toISOString().split('T')[0],
      duration: Math.round(elapsedSeconds / 60) || 1,
      totalVolume,
      exercises,
      notes: workoutNote.trim() || undefined
    };

    // V2 - Calculate if any Personal Records (PR) were broken in this session
    const brokenPRs = calculatePersonalRecords(
      exercises,
      personalRecords,
      new Date().toISOString().split('T')[0]
    );

    if (brokenPRs.length > 0) {
      setCompletedWorkoutData(completed);
      setNewPRs(brokenPRs);
      setShowCelebration(true);
    } else {
      finishWorkout(completed, []);
    }
  };

  const handleCancelWorkout = () => {
    setConfirmModal({
      message: 'Mevcut antrenmanı iptal etmek istediğinizden emin misiniz? Kaydedilmemiş verileriniz kaybolacaktır.',
      onConfirm: () => { 
        setConfirmModal(null); 
        cancelRestNotification();
        cancelWorkout(); 
      }
    });
  };

  // Formatting utility
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  // Arka plan servisi dinleyicisi bayat closure yakalamasın diye en güncel
  // fonksiyonlar her render'dan SONRA ref'e yazılır (render sırasında değil).
  useEffect(() => {
    handleFinishWorkoutRef.current = handleFinishWorkout;
    skipRestRef.current = skipRest;
  });

  return (
    <div className="active-workout-container anim-fade-in">
      {/* Top sticky tracker */}
      <header className="active-workout-header glass-panel">
        <div className="header-info">
          <div className="active-badge pulse-glowing-mint">
            <span>● CANLI SEANS</span>
          </div>
          {activeProgram.parentName && (
            <span className="active-parent-name">{activeProgram.parentName}</span>
          )}
          <h1 className="active-program-title" title={activeProgram.name}>
            {activeProgram.sessionName || activeProgram.name}
          </h1>
        </div>

        <div className="header-timer" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} className="timer-icon" />
          <span className="duration-clock" style={{ color: isTimerRunning ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {formatTime(elapsedSeconds)}
          </span>
          <button
            onClick={toggleTimer}
            className={`btn-timer-toggle ${isTimerRunning ? 'running' : 'paused'}`}
            style={{
              background: 'var(--surface-4)',
              border: '1px solid var(--border-medium)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isTimerRunning ? 'var(--accent-mint)' : 'var(--text-primary)',
              cursor: 'pointer',
              marginLeft: '6px',
              transition: 'all 0.2s ease',
            }}
            aria-label={isTimerRunning ? "Antrenmanı Duraklat" : "Antrenmana Devam Et"}
          >
            {isTimerRunning ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '1px' }} />}
          </button>
        </div>

        <div className="header-actions">
          <button onClick={handleCancelWorkout} className="btn btn-danger btn-sm btn-cancel">
            <X size={16} /> İptal
          </button>
          <button onClick={handleFinishWorkout} className="btn btn-primary btn-sm btn-finish">
            Antrenmanı Bitir
          </button>
        </div>
      </header>

      {/* Main Grid: Exercises on left, Rest timer floating on right */}
      <div className="active-workout-layout">
        <div className={`exercises-scroller ${isResting ? 'rest-bar-visible' : ''}`}>
          {exercises.map((ex, exIdx) => (

            <div key={ex.id} className="active-exercise-card glass-panel">
              <div className="active-card-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 className="active-ex-name" style={{ margin: 0 }}>{ex.name}</h3>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="badge badge-cyan">{ex.category}</span>
                      <span className="rest-badge-mini">Dinlenme: {ex.restTime} sn</span>
                    </div>
                  </div>
                  {/* Volume Sparkline */}
                  {renderSparkline(ex.exerciseId)}
                </div>
                {ex.notes && (
                  <div className="exercise-coach-note" style={{ marginTop: '6px', fontSize: '12px', color: 'var(--accent-cyan)', fontStyle: 'italic', background: 'var(--accent-cyan-bg)', padding: '6px 10px', borderRadius: '4px', borderLeft: '2px solid var(--accent-cyan)' }}>
                    <strong>Not:</strong> {ex.notes}
                  </div>
                )}
              </div>

              {/* Set details grid */}
              <div className="active-sets-table">
                <div className="active-table-row labels desktop-only">
                  <span>Set</span>
                  <span>Hedef / Son Sefer</span>
                  <span>Ağırlık (kg)</span>
                  <span>Tekrar</span>
                  <span>RIR</span>
                  <span>Tamamla</span>
                  <span></span>
                </div>

                {ex.sets.map((set, setIdx) => {
                  const lastSet = getLastSetPerformed(ex.exerciseId, setIdx);
                  const lastHint = lastSet
                    ? `${lastSet.actualWeight ?? lastSet.weight}kg × ${lastSet.actualReps ?? lastSet.reps}`
                    : null;
                  // Hareket seviyesi hedefleri set seviyesini geçersiz kılar.
                  const target = resolveSetTarget(ex, set);
                  return (
                  <React.Fragment key={set.id}>
                    {/* Desktop Layout Row */}
                    <div className={`active-table-row data desktop-only ${set.completed ? 'set-done' : ''}`}>
                      <span className="set-num">{setIdx + 1}</span>
                      <div style={{ textAlign: 'left' }}>
                        <span className="set-target">{target.weight}kg x {target.reps} tek {target.rir !== undefined ? `@RIR${target.rir}` : ''}</span>
                        {lastHint && <div style={{ fontSize: '10px', color: 'var(--accent-mint)', fontWeight: 700, marginTop: '2px' }}>↩ {lastHint}</div>}
                      </div>

                      <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                        <input
                          type="number"
                          value={set.actualWeight !== undefined ? set.actualWeight : ''}
                          placeholder={target.weight !== undefined ? target.weight.toString() : ''}
                          onChange={(e) =>
                            handleActualChange(exIdx, setIdx, 'actualWeight', parseFloat(e.target.value) || 0)
                          }
                          className="form-input mini-input"
                          disabled={set.completed}
                        />
                      </div>

                      <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                        <input
                          type="number"
                          value={set.actualReps !== undefined ? set.actualReps : ''}
                          placeholder={set.reps !== undefined ? set.reps.toString() : ''}
                          onChange={(e) =>
                            handleActualChange(exIdx, setIdx, 'actualReps', parseInt(e.target.value) || 0)
                          }
                          className="form-input mini-input"
                          disabled={set.completed}
                        />
                      </div>

                      <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          placeholder={target.rir !== undefined ? target.rir.toString() : '2'}
                          value={set.actualRir !== undefined ? set.actualRir : ''}
                          onChange={(e) =>
                            handleActualChange(exIdx, setIdx, 'actualRir', parseInt(e.target.value) || 0)
                          }
                          className="form-input mini-input"
                          disabled={set.completed}
                        />
                      </div>

                      <div className="checkbox-cell">
                        <button
                          id={`set-complete-btn-${exIdx}-${setIdx}`}
                          aria-label={`set-complete-btn-${exIdx}-${setIdx}`}
                          onClick={() => toggleSetComplete(exIdx, setIdx)}
                          className={`custom-checkbox ${set.completed ? 'checked' : ''}`}
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>
                      </div>

                      <div className="checkbox-cell">
                        {!set.completed && ex.sets.length > 1 && (
                          <button
                            onClick={() => handleRemoveSetDuringWorkout(exIdx, setIdx)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '4px', lineHeight: 1 }}
                            aria-label="Seti sil"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mobile Layout Row */}
                    <div className={`active-table-row-mobile mobile-only ${set.completed ? 'set-done' : ''}`}>
                      <div className="set-mobile-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="set-num-badge">Set {setIdx + 1}</span>
                          {!set.completed && ex.sets.length > 1 && (
                            <button
                              onClick={() => handleRemoveSetDuringWorkout(exIdx, setIdx)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', lineHeight: 1 }}
                              aria-label="Seti sil"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                        <span className="set-target-desc">
                          Hedef: {target.weight}kg x {target.reps} tek
                          {target.rir !== undefined && ` · RIR ${target.rir}`}
                        </span>
                        {lastHint && <span style={{ fontSize: '10px', color: 'var(--accent-mint)', fontWeight: 700 }}>↩ {lastHint}</span>}
                      </div>

                      <button
                        type="button"
                        onClick={() => !set.completed && setActiveSetEdit({ exIdx, setIdx })}
                        className="mobile-set-log-pill"
                        disabled={set.completed}
                      >
                        <span>{set.actualWeight !== undefined ? `${set.actualWeight} kg` : `${target.weight} kg`}</span>
                        <span className="pill-divider">x</span>
                        <span>{set.actualReps !== undefined ? `${set.actualReps} tek` : `${target.repsValue} tek`}</span>
                        <span className="pill-divider">|</span>
                        <span>{set.actualRir !== undefined ? `RIR ${set.actualRir}` : `RIR ${target.rir !== undefined ? target.rir : '-'}`}</span>
                      </button>

                      <div className="checkbox-cell-mobile">
                        <button
                          id={`set-complete-btn-mobile-${exIdx}-${setIdx}`}
                          aria-label={`set-complete-btn-mobile-${exIdx}-${setIdx}`}
                          onClick={() => toggleSetComplete(exIdx, setIdx)}
                          className={`custom-checkbox ${set.completed ? 'checked' : ''}`}
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </React.Fragment>
                  );
                })}
              </div>

              <button onClick={() => handleAddSetDuringWorkout(exIdx)} className="btn-add-set-during">
                <Plus size={14} /> Set Ekle
              </button>
            </div>
          ))}

          {/* Antrenman notu */}
          <div className="glass-panel" style={{ padding: '16px 20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              <FileText size={14} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 6 }} />
              Antrenman Notu <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(opsiyonel)</span>
            </label>
            <textarea
              value={workoutNote}
              onChange={(e) => setWorkoutNote(e.target.value)}
              placeholder="Bugün nasıl hissettiniz? Notlarınız burada saklanır..."
              rows={2}
              style={{
                width: '100%',
                background: 'var(--surface-3)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                padding: '10px 12px',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        <RestTimerPanel
          isResting={isResting}
          restSecondsLeft={restSecondsLeft}
          restDuration={restDuration}
          currentRestExercise={currentRestExercise}
          skipRest={skipRest}
          changeRestDuration={changeRestDuration}
        />
      </div>


      {/* Custom confirm modal (replaces window.confirm) */}
      {confirmModal && (
        <div className="bottom-sheet-backdrop" onClick={() => setConfirmModal(null)}>
          <div className="bottom-sheet-content glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', gap: '20px' }}>
            <div className="bottom-sheet-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <div>
                <h3 style={{ fontSize: '16px' }}>Emin misiniz?</h3>
                <p style={{ marginTop: '8px', lineHeight: 1.5 }}>{confirmModal.message}</p>
              </div>
              <button className="btn-close-sheet" onClick={() => setConfirmModal(null)}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" style={{ flex: 1, padding: '14px' }} onClick={() => setConfirmModal(null)}>İptal</button>
              <button className="btn btn-danger" style={{ flex: 1, padding: '14px' }} onClick={confirmModal.onConfirm}>Evet, devam et</button>
            </div>
          </div>
        </div>
      )}

      {/* V2 - Celebratory PR Broken Overlay */}
      {showCelebration && completedWorkoutData && (
        <div className="celebration-backdrop">
          {/* Confetti Generation Loop */}
          <div className="confetti-container">
            {Array.from({ length: 30 }).map((_, i) => {
              const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];
              const randomColor = colors[i % colors.length];
              const leftOffset = `${(i * 3.3) % 100}%`;
              const animDelay = `${(i * 0.15) % 3}s`;
              const animDuration = `${2.5 + (i * 0.05) % 1.5}s`;
              
              return (
                <div
                  key={i}
                  className="confetti-piece"
                  style={{
                    backgroundColor: randomColor,
                    left: leftOffset,
                    animationDelay: animDelay,
                    animationDuration: animDuration
                  }}
                />
              );
            })}
          </div>

          <div className="celebration-card glass-panel anim-slide-up">
            <Trophy className="pr-trophy" size={44} aria-hidden="true" />
            <h2 className="pr-congrats-title">Yeni Kişisel Rekor!</h2>
            <p className="welcome-subtitle">Bu antrenmanda sınırlarınızı zorlayarak yeni zirvelere ulaştınız!</p>
            
            <div className="pr-broken-list">
              {newPRs.map((pr, idx) => (
                <div key={idx} className="pr-broken-item">
                  <span className="pr-item-name">{pr.exerciseName}</span>
                  <span className="pr-item-stats">
                    En Yüksek: {pr.maxWeight} kg x {pr.maxReps} tekrar | Tahmini 1RM: {pr.oneRepMax} kg
                  </span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => finishWorkout(completedWorkoutData, newPRs)}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '10px' }}
            >
              Kaydet ve Devam Et <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Touch Sliders Bottom Sheet Drawer for Mobile */}
      {activeSetEdit && (
        <div className="bottom-sheet-backdrop" onClick={() => setActiveSetEdit(null)}>
          <div className="bottom-sheet-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="bottom-sheet-header">
              <div>
                <h3>{exercises[activeSetEdit.exIdx].name}</h3>
                <p>Set {activeSetEdit.setIdx + 1} Güncellemesi</p>
              </div>
              <button className="btn-close-sheet" onClick={() => setActiveSetEdit(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Weights Slider Picker */}
            <div className="slider-group">
              <div className="slider-label-row">
                <span>Ağırlık:</span>
                <span className="slider-value-display">
                  <strong>{exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualWeight ?? resolveSetTarget(exercises[activeSetEdit.exIdx], exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx]).weight}</strong> kg
                </span>
              </div>
              <div className="slider-control-row">
                <button
                  className="btn btn-secondary btn-icon-small"
                  onClick={() => {
                    const cur = exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualWeight ?? resolveSetTarget(exercises[activeSetEdit.exIdx], exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx]).weight;
                    handleActualChange(activeSetEdit.exIdx, activeSetEdit.setIdx, 'actualWeight', Math.max(0, cur - 5));
                  }}
                >-5</button>
                <button
                  className="btn btn-secondary btn-icon-small"
                  onClick={() => {
                    const cur = exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualWeight ?? resolveSetTarget(exercises[activeSetEdit.exIdx], exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx]).weight;
                    handleActualChange(activeSetEdit.exIdx, activeSetEdit.setIdx, 'actualWeight', Math.max(0, cur - 2.5));
                  }}
                >-2.5</button>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="2.5"
                  value={exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualWeight ?? resolveSetTarget(exercises[activeSetEdit.exIdx], exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx]).weight}
                  onChange={(e) => handleActualChange(activeSetEdit.exIdx, activeSetEdit.setIdx, 'actualWeight', parseFloat(e.target.value))}
                  className="touch-slider"
                />
                <button
                  className="btn btn-secondary btn-icon-small"
                  onClick={() => {
                    const cur = exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualWeight ?? resolveSetTarget(exercises[activeSetEdit.exIdx], exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx]).weight;
                    handleActualChange(activeSetEdit.exIdx, activeSetEdit.setIdx, 'actualWeight', cur + 2.5);
                  }}
                >+2.5</button>
                <button
                  className="btn btn-secondary btn-icon-small"
                  onClick={() => {
                    const cur = exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualWeight ?? resolveSetTarget(exercises[activeSetEdit.exIdx], exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx]).weight;
                    handleActualChange(activeSetEdit.exIdx, activeSetEdit.setIdx, 'actualWeight', cur + 5);
                  }}
                >+5</button>
              </div>
            </div>

            {/* Reps Slider Picker */}
            <div className="slider-group">
              <div className="slider-label-row">
                <span>Tekrar:</span>
                <span className="slider-value-display">
                  <strong>{exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualReps ?? resolveSetTarget(exercises[activeSetEdit.exIdx], exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx]).repsValue}</strong> tekrar
                </span>
              </div>
              <div className="slider-control-row">
                <button 
                  className="btn btn-secondary btn-icon-small"
                  onClick={() => {
                    const current = exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualReps ?? resolveSetTarget(exercises[activeSetEdit.exIdx], exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx]).repsValue;
                    handleActualChange(activeSetEdit.exIdx, activeSetEdit.setIdx, 'actualReps', Math.max(1, current - 1));
                  }}
                >
                  -1
                </button>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  step="1" 
                  value={exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualReps ?? resolveSetTarget(exercises[activeSetEdit.exIdx], exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx]).repsValue}
                  onChange={(e) => handleActualChange(activeSetEdit.exIdx, activeSetEdit.setIdx, 'actualReps', parseInt(e.target.value))}
                  className="touch-slider"
                />
                <button 
                  className="btn btn-secondary btn-icon-small"
                  onClick={() => {
                    const current = exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualReps ?? resolveSetTarget(exercises[activeSetEdit.exIdx], exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx]).repsValue;
                    handleActualChange(activeSetEdit.exIdx, activeSetEdit.setIdx, 'actualReps', current + 1);
                  }}
                >
                  +1
                </button>
              </div>
            </div>

            {/* RIR Slider Picker */}
            <div className="slider-group">
              <div className="slider-label-row">
                <span>RIR (Tükenişe Kalan):</span>
                <span className="slider-value-display">
                  <strong>RIR {exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualRir ?? resolveSetTarget(exercises[activeSetEdit.exIdx], exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx]).rir ?? 2}</strong>
                </span>
              </div>
              <div className="slider-control-row">
                <button 
                  className="btn btn-secondary btn-icon-small"
                  onClick={() => {
                    const current = exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualRir ?? resolveSetTarget(exercises[activeSetEdit.exIdx], exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx]).rir ?? 2;
                    handleActualChange(activeSetEdit.exIdx, activeSetEdit.setIdx, 'actualRir', Math.max(0, current - 1));
                  }}
                >
                  -1
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  step="1" 
                  value={exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualRir ?? resolveSetTarget(exercises[activeSetEdit.exIdx], exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx]).rir ?? 2}
                  onChange={(e) => handleActualChange(activeSetEdit.exIdx, activeSetEdit.setIdx, 'actualRir', parseInt(e.target.value))}
                  className="touch-slider"
                />
                <button 
                  className="btn btn-secondary btn-icon-small"
                  onClick={() => {
                    const current = exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualRir ?? resolveSetTarget(exercises[activeSetEdit.exIdx], exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx]).rir ?? 2;
                    handleActualChange(activeSetEdit.exIdx, activeSetEdit.setIdx, 'actualRir', Math.min(10, current + 1));
                  }}
                >
                  +1
                </button>
              </div>
            </div>

            <div className="sheet-actions" style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button"
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '14px' }} 
                onClick={() => setActiveSetEdit(null)}
              >
                Yalnızca Güncelle
              </button>
              <button 
                type="button"
                className="btn btn-primary" 
                style={{ flex: 1, padding: '14px' }} 
                onClick={() => {
                  // Mark set complete and close the bottom sheet
                  toggleSetComplete(activeSetEdit.exIdx, activeSetEdit.setIdx);
                  setActiveSetEdit(null);
                }}
              >
                Seti Tamamla & Eşitle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
