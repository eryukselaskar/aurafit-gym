import React, { useState, useEffect, useRef } from 'react';
import { Dumbbell, FastForward, Check, X, Clock, Bell, Plus, ArrowRight, Play, Pause } from 'lucide-react';
import type { WorkoutProgram, WorkoutExercise, CompletedWorkout, WorkoutSet, PersonalRecord } from '../types';
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

export const ActiveWorkout: React.FC<ActiveWorkoutProps> = ({
  activeProgram,
  finishWorkout,
  cancelWorkout,
  personalRecords,
  history
}) => {
  // Helper to parse saved active workout state
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

  // Helper to save active workout state to localStorage
  const saveWorkoutState = (
    currentExercises = exercises,
    running = isTimerRunning,
    currentElapsed = elapsedSeconds,
    resting = isResting,
    restLeft = restSecondsLeft,
    restDur = restDuration,
    restEx = currentRestExercise,
    restStart = isResting ? (getSavedWorkoutState()?.restStartTime || Date.now()) : null
  ) => {
    try {
      const saved = getSavedWorkoutState();
      let accumulated = currentElapsed;
      let startTime = Date.now();
      
      if (running) {
        startTime = saved && saved.isTimerRunning ? saved.workoutStartTime : Date.now();
        accumulated = saved && saved.isTimerRunning ? saved.accumulatedTime : currentElapsed;
        accumulated = currentElapsed;
        startTime = Date.now();
      } else {
        accumulated = currentElapsed;
        startTime = Date.now();
      }

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
    return [];
  });

  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(() => {
    const saved = getSavedWorkoutState();
    if (saved && saved.activeProgram?.id === activeProgram.id) {
      return saved.isTimerRunning !== undefined ? saved.isTimerRunning : true;
    }
    return true;
  });

  const timerIntervalRef = useRef<any>(null);

  // Refs to avoid stale closures in listeners
  const handleFinishWorkoutRef = useRef<any>(null);
  const skipRestRef = useRef<any>(null);

  // Initialize program copy with actual fields filled OR restore saved state
  useEffect(() => {
    const saved = getSavedWorkoutState();
    let initialElapsed = 0;
    
    if (saved && saved.activeProgram?.id === activeProgram.id && saved.exercises && saved.exercises.length > 0) {
      if (saved.isTimerRunning) {
        const diff = Math.floor((Date.now() - saved.workoutStartTime) / 1000);
        initialElapsed = (saved.accumulatedTime || 0) + Math.max(0, diff);
      } else {
        initialElapsed = saved.accumulatedTime || 0;
      }
      
      startWorkoutService(activeProgram.name, initialElapsed);
      if (!saved.isTimerRunning) {
        pauseWorkoutService();
      }
    } else {
      const initialized = activeProgram.exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(s => ({
          ...s,
          actualReps: s.reps,
          actualWeight: s.weight,
          completed: false
        }))
      }));
      setExercises(initialized);
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
      } catch (e) {}
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
  }, [activeProgram]);

  // Main React-side timer clock
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

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

  useEffect(() => {
    if (exercises.length === 0) return;
    syncWithBackgroundService(exercises, isResting, restSecondsLeft);
    saveWorkoutState(exercises, isTimerRunning, elapsedSeconds, isResting, restSecondsLeft, restDuration, currentRestExercise);
  }, [exercises]);

  const toggleTimer = () => {
    setIsTimerRunning(prev => {
      const next = !prev;
      if (next) {
        resumeWorkoutService(elapsedSeconds);
      } else {
        pauseWorkoutService();
      }
      saveWorkoutState(exercises, next, elapsedSeconds, isResting, restSecondsLeft, restDuration, currentRestExercise);
      return next;
    });
  };

  const [showCelebration, setShowCelebration] = useState(false);
  const [newPRs, setNewPRs] = useState<PersonalRecord[]>([]);
  const [completedWorkoutData, setCompletedWorkoutData] = useState<CompletedWorkout | null>(null);

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
  
  // Mobile set slider picker state
  const [activeSetEdit, setActiveSetEdit] = useState<{ exIdx: number; setIdx: number } | null>(null);

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
  const [currentRestExercise, setCurrentRestExercise] = useState<string>(() => {
    const saved = getSavedWorkoutState();
    if (saved && saved.activeProgram?.id === activeProgram.id) {
      return saved.currentRestExercise || '';
    }
    return '';
  });
  
  const restIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (isResting && restSecondsLeft > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestSecondsLeft(prev => {
          if (prev <= 1) {
            handleRestComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [isResting, restSecondsLeft]);

  // Synthesize dynamic chime when rest finishes using Web Audio API
  const playSynthesizedChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
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
    playSynthesizedChime();
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]); // Short dynamic vibration
    }
    syncWithBackgroundService(exercises, false, 0);
    saveWorkoutState(exercises, isTimerRunning, elapsedSeconds, false, 0, restDuration, currentRestExercise, null);
  };

  // Rest Controls
  const skipRest = () => {
    setIsResting(false);
    setRestSecondsLeft(0);
    syncWithBackgroundService(exercises, false, 0);
    saveWorkoutState(exercises, isTimerRunning, elapsedSeconds, false, 0, restDuration, currentRestExercise, null);
  };

  const addRestTime = (seconds: number) => {
    let nextSecondsLeft = 0;
    setRestSecondsLeft(prev => {
      const next = prev + seconds;
      nextSecondsLeft = next;
      syncWithBackgroundService(exercises, isResting, next);
      return next;
    });
    setRestDuration(prev => {
      const nextDuration = prev + seconds;
      saveWorkoutState(exercises, isTimerRunning, elapsedSeconds, isResting, nextSecondsLeft, nextDuration, currentRestExercise, Date.now());
      return nextDuration;
    });
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
      
      setCurrentRestExercise(targetEx.name);
      setRestDuration(targetEx.restTime);
      setRestSecondsLeft(targetEx.restTime);
      setIsResting(true);

      syncWithBackgroundService(updated, true, targetEx.restTime);
      saveWorkoutState(updated, isTimerRunning, elapsedSeconds, true, targetEx.restTime, targetEx.restTime, targetEx.name, Date.now());
    } else {
      setIsResting(false);
      setRestSecondsLeft(0);
      syncWithBackgroundService(updated, false, 0);
      saveWorkoutState(updated, isTimerRunning, elapsedSeconds, false, 0, restDuration, currentRestExercise, null);
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
    // Check if at least one set is completed
    const completedSetsCount = exercises.reduce((count, ex) => 
      count + ex.sets.filter(s => s.completed).length, 0
    );

    if (completedSetsCount === 0) {
      const confirmFinish = window.confirm(
        'Hiçbir seti tamamlamadınız. Antrenmanı yine de bitirmek istiyor musunuz?'
      );
      if (!confirmFinish) return;
    }

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
      duration: Math.round(elapsedSeconds / 60) || 1, // at least 1 minute
      totalVolume,
      exercises
    };

    // V2 - Calculate if any Personal Records (PR) were broken in this session based on max weight
    const brokenPRs: PersonalRecord[] = [];

    exercises.forEach(ex => {
      const completedSets = ex.sets.filter(s => s.completed);
      if (completedSets.length === 0) return;

      let bestWeight = 0;
      let bestReps = 0;

      completedSets.forEach(s => {
        const weight = s.actualWeight ?? s.weight;
        const reps = s.actualReps ?? s.reps;
        
        if (weight > bestWeight || (weight === bestWeight && reps > bestReps)) {
          bestWeight = weight;
          bestReps = reps;
        }
      });

      const bestOneRepMax = Math.round((bestReps === 1 ? bestWeight : bestWeight * (1 + bestReps / 30)) * 10) / 10;

      // Find existing personal record
      const existingPR = personalRecords.find(pr => pr.exerciseId === ex.exerciseId);
      if (!existingPR || bestWeight > existingPR.maxWeight || (bestWeight === existingPR.maxWeight && bestReps > existingPR.maxReps)) {
        brokenPRs.push({
          exerciseId: ex.exerciseId,
          exerciseName: ex.name,
          maxWeight: bestWeight,
          maxReps: bestReps,
          oneRepMax: bestOneRepMax,
          date: new Date().toISOString().split('T')[0]
        });
      }
    });

    if (brokenPRs.length > 0) {
      setCompletedWorkoutData(completed);
      setNewPRs(brokenPRs);
      setShowCelebration(true);
    } else {
      finishWorkout(completed, []);
    }
  };

  const handleCancelWorkout = () => {
    const confirm = window.confirm(
      'Mevcut antrenmanı iptal etmek istediğinizden emin misiniz? Kaydedilmemiş verileriniz kaybolacaktır.'
    );
    if (confirm) {
      cancelWorkout();
    }
  };

  // Formatting utility
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  handleFinishWorkoutRef.current = handleFinishWorkout;
  skipRestRef.current = skipRest;

  return (
    <div className="active-workout-container anim-fade-in">
      {/* Top sticky tracker */}
      <header className="active-workout-header glass-panel">
        <div className="header-info">
          <div className="active-badge pulse-glowing-mint">
            <span>● CANLI SEANS</span>
          </div>
          <h1 className="active-program-title">{activeProgram.name}</h1>
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
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
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
        <div className="exercises-scroller">
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
                  <div className="exercise-coach-note" style={{ marginTop: '6px', fontSize: '12px', color: 'var(--accent-cyan)', fontStyle: 'italic', background: 'rgba(6, 182, 212, 0.05)', padding: '6px 10px', borderRadius: '4px', borderLeft: '2px solid var(--accent-cyan)' }}>
                    <strong>Not:</strong> {ex.notes}
                  </div>
                )}
              </div>

              {/* Set details grid */}
              <div className="active-sets-table">
                <div className="active-table-row labels desktop-only">
                  <span>Set</span>
                  <span>Hedef</span>
                  <span>Ağırlık (kg)</span>
                  <span>Tekrar</span>
                  <span>RIR</span>
                  <span>Tamamla</span>
                </div>

                {ex.sets.map((set, setIdx) => (
                  <React.Fragment key={set.id}>
                    {/* Desktop Layout Row */}
                    <div className={`active-table-row data desktop-only ${set.completed ? 'set-done' : ''}`}>
                      <span className="set-num">{setIdx + 1}</span>
                      <span className="set-target">{set.weight}kg x {ex.minReps && ex.maxReps ? `${ex.minReps}-${ex.maxReps} tekrar` : `${set.reps} tekrar`} {set.rir !== undefined ? `@RIR${set.rir}` : ''}</span>
                      
                      {/* Weight (Ağırlık) */}
                      <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                        <input
                          type="number"
                          value={set.actualWeight ?? ''}
                          onChange={(e) =>
                            handleActualChange(exIdx, setIdx, 'actualWeight', parseFloat(e.target.value) || 0)
                          }
                          className="form-input mini-input"
                          disabled={set.completed}
                        />
                      </div>

                      {/* Reps (Tekrar) */}
                      <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                        <input
                          type="number"
                          value={set.actualReps ?? ''}
                          onChange={(e) =>
                            handleActualChange(exIdx, setIdx, 'actualReps', parseInt(e.target.value) || 0)
                          }
                          className="form-input mini-input"
                          disabled={set.completed}
                        />
                      </div>

                      {/* RIR */}
                      <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          placeholder="RIR"
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
                    </div>

                    {/* Mobile Layout Row (Touch friendly single pill log) */}
                    <div className={`active-table-row-mobile mobile-only ${set.completed ? 'set-done' : ''}`}>
                      <div className="set-mobile-info">
                        <span className="set-num-badge">Set {setIdx + 1}</span>
                        <span className="set-target-desc">Hedef: {set.weight}kg x {ex.minReps && ex.maxReps ? `${ex.minReps}-${ex.maxReps} tekrar` : `${set.reps} tekrar`} {set.rir !== undefined ? `@RIR${set.rir}` : ''}</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => !set.completed && setActiveSetEdit({ exIdx, setIdx })}
                        className="mobile-set-log-pill"
                        disabled={set.completed}
                      >
                        <span>{set.actualWeight !== undefined ? `${set.actualWeight} kg` : `${set.weight} kg`}</span>
                        <span className="pill-divider">x</span>
                        <span>{set.actualReps !== undefined ? `${set.actualReps} tek` : `${set.reps} tek`}</span>
                        <span className="pill-divider">|</span>
                        <span>{set.actualRir !== undefined ? `RIR ${set.actualRir}` : `RIR ${set.rir !== undefined ? set.rir : '-'}`}</span>
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
                ))}
              </div>

              <button onClick={() => handleAddSetDuringWorkout(exIdx)} className="btn-add-set-during">
                <Plus size={14} /> Set Ekle
              </button>
            </div>
          ))}
        </div>

        {/* Dynamic floating/sticky Rest Timer panel */}
        <div className={`rest-timer-pane ${isResting ? 'resting' : 'idle'}`}>
          <div className={`rest-timer-card glass-panel ${isResting ? 'active-rest' : 'inactive-rest'}`}>
            {isResting ? (
              <>
                {/* Desktop View (Circular visual countdown) */}
                <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
                  <div className="rest-card-header">
                    <Bell className="bell-icon animated-bell" size={20} />
                    <span>DİNLENME SÜRESİ</span>
                  </div>

                  <p className="rest-next-ex">Sıradaki: {currentRestExercise}</p>

                  <div className="timer-circle-container">
                    <svg className="timer-circle-svg">
                      <defs>
                        <linearGradient id="timerGradient" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="var(--accent-cyan)" />
                          <stop offset="100%" stopColor="var(--accent-violet)" />
                        </linearGradient>
                      </defs>
                      <circle className="timer-circle-bg" cx="80" cy="80" r="70" />
                      <circle
                        className="timer-circle-progress"
                        cx="80"
                        cy="80"
                        r="70"
                        strokeDasharray={440}
                        strokeDashoffset={(restSecondsLeft / restDuration) * 440}
                      />
                    </svg>
                    <div className="timer-text-container">
                      <span className="timer-time">{restSecondsLeft}</span>
                      <span className="timer-label">saniye</span>
                    </div>
                  </div>

                  <div className="rest-timer-actions">
                    <button onClick={() => addRestTime(30)} className="btn btn-secondary btn-sm">
                      +30 sn
                    </button>
                    <button id="skip-rest-btn-desktop" onClick={skipRest} className="btn btn-primary btn-sm btn-icon">
                      <FastForward size={16} />
                    </button>
                  </div>
                </div>

                {/* Mobile View (Sleek Horizontal Player Bar) */}
                <div className="mobile-only mobile-horizontal-rest" style={{ width: '100%' }}>
                  <div className="rest-info-group">
                    <Bell className="bell-icon animated-bell" size={18} />
                    <div className="rest-details">
                      <span className="rest-title-lbl">DİNLENME SÜRESİ</span>
                      <span className="rest-next-lbl">Sıradaki: {currentRestExercise}</span>
                    </div>
                  </div>
                  
                  <div className="rest-counter-val">
                    {restSecondsLeft} <span className="sec-lbl">sn</span>
                  </div>

                  <div className="rest-actions-group">
                    <button onClick={() => addRestTime(30)} className="btn btn-secondary btn-sm compact-btn">
                      +30s
                    </button>
                    <button id="skip-rest-btn-mobile" aria-label="skip-rest-btn-mobile" onClick={skipRest} className="btn btn-primary btn-sm compact-btn">
                      <FastForward size={14} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="resting-idle-state">
                <Dumbbell size={36} className="idle-dumbell" />
                <h3>Hazır</h3>
                <p className="idle-sub">Bir seti tamamladığınızda dinlenme sayacı otomatik olarak başlayacaktır.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .active-workout-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .active-workout-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(13, 15, 23, 0.85);
        }

        .header-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .active-badge {
          font-size: 11px;
          font-weight: 800;
          color: var(--accent-mint);
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
        }

        .pulse-glowing-mint {
          animation: glowMint 1.5s infinite;
        }

        @keyframes glowMint {
          0% { opacity: 0.7; }
          50% { opacity: 1; text-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
          100% { opacity: 0.7; }
        }

        .active-program-title {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .header-timer {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-light);
          padding: 8px 16px;
          border-radius: var(--radius-md);
        }

        .timer-icon {
          color: var(--accent-violet);
        }

        .duration-clock {
          font-family: var(--font-headings);
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .btn-cancel {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }

        .btn-cancel:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.4);
        }

        .btn-finish {
          background: var(--gradient-primary);
          box-shadow: 0 4px 12px rgba(236, 72, 153, 0.25);
        }

        .btn-finish:hover {
          box-shadow: 0 6px 16px rgba(236, 72, 153, 0.4);
        }

        /* Layout Grid */
        .active-workout-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          align-items: start;
        }

        .exercises-scroller {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .active-exercise-card {
          padding: 24px;
        }

        .active-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 14px;
          margin-bottom: 16px;
        }

        .active-ex-name {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .rest-indicator {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .rest-badge-mini {
          font-size: 11px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-light);
          color: var(--text-secondary);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-weight: 600;
        }

        /* Sets log table formatting */
        .active-sets-table {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .active-table-row {
          display: grid;
          grid-template-columns: 40px 1.4fr 1fr 1fr 1fr 60px;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .active-table-row.labels {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: center;
        }

        .active-table-row.data {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-light);
          text-align: center;
        }

        .active-table-row.data:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: var(--border-medium);
        }

        .active-table-row.set-done {
          background: rgba(16, 185, 129, 0.04);
          border-color: rgba(16, 185, 129, 0.2);
          opacity: 0.7;
        }

        .set-num {
          font-weight: 800;
          color: var(--text-secondary);
        }

        .active-table-row.set-done .set-num {
          color: var(--accent-mint);
        }

        .set-target {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .checkbox-cell {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .btn-add-set-during {
          background: transparent;
          border: 1px dashed var(--border-medium);
          color: var(--text-secondary);
          width: 100%;
          padding: 10px;
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          margin-top: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all var(--transition-fast);
        }

        .btn-add-set-during:hover {
          color: var(--text-primary);
          border-color: var(--accent-violet);
          background: rgba(255, 255, 255, 0.01);
        }

        /* Rest Timer Column */
        .rest-timer-pane {
          position: sticky;
          top: 94px;
        }

        .rest-timer-card {
          padding: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          min-height: 320px;
        }

        .rest-timer-card.active-rest {
          background: radial-gradient(circle at center, rgba(6, 182, 212, 0.05) 0%, transparent 80%),
                      var(--bg-card);
          border-color: rgba(6, 182, 212, 0.25);
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.1);
        }

        .rest-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          font-weight: 800;
          color: var(--accent-cyan);
          letter-spacing: 0.06em;
        }

        .bell-icon {
          color: var(--accent-cyan);
        }

        .animated-bell {
          animation: ringBell 2s infinite alternate;
        }

        @keyframes ringBell {
          0% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-15deg); }
          60% { transform: rotate(10deg); }
          80% { transform: rotate(-10deg); }
          100% { transform: rotate(0deg); }
        }

        .rest-next-ex {
          font-weight: 600;
          font-size: 13px;
          color: var(--text-secondary);
          text-align: center;
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .rest-timer-actions {
          display: flex;
          gap: 12px;
          width: 100%;
          justify-content: center;
        }

        .resting-idle-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 15px;
          text-align: center;
          color: var(--text-muted);
          padding: 20px;
        }

        .idle-dumbell {
          color: var(--border-medium);
        }

        .resting-idle-state h3 {
          color: var(--text-secondary);
          font-size: 18px;
        }

        .idle-sub {
          font-size: 12px;
          line-height: 1.5;
        }

        @media (max-width: 1000px) {
          .active-workout-layout {
            grid-template-columns: 1fr;
          }
          .rest-timer-pane {
            position: fixed;
            top: auto !important;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            width: 280px;
          }
          .rest-timer-pane.idle {
            display: none !important;
          }
          .rest-timer-card {
            min-height: auto;
            padding: 20px;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border-medium);
            background: var(--bg-card-solid);
          }
          .timer-circle-container {
            width: 120px;
            height: 120px;
          }
          .timer-time {
            font-size: 24px;
          }
        }

        @media (max-width: 768px) {
          .active-table-row-mobile.mobile-only {
            display: flex !important;
          }
          .active-workout-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
            padding: 15px;
          }
          .header-actions {
            width: 100%;
          }
          .header-actions button {
            flex: 1;
          }
          .active-table-row {
            grid-template-columns: 30px 1.4fr 1fr 1fr 1fr 40px;
            gap: 6px;
            padding: 6px;
          }
          .set-target {
            font-size: 11px;
          }
          .rest-timer-pane {
            position: fixed;
            top: auto !important;
            bottom: calc(70px + env(safe-area-inset-bottom, 0px)) !important;
            left: 0 !important;
            right: 0 !important;
            width: 100vw !important;
            max-width: 100% !important;
            z-index: 1000;
          }
          .rest-timer-card {
            border-radius: 0 !important;
            border-left: none !important;
            border-right: none !important;
            border-bottom: none !important;
            padding: 12px 20px !important;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4) !important;
            width: 100% !important;
            background: rgba(13, 15, 23, 0.95) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            min-height: auto !important;
          }
        }

        /* Desktop/Mobile Visibility Utilities */
        @media (min-width: 769px) {
          .desktop-only { display: block !important; }
          .mobile-only { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: block !important; }
        }

        /* Mobile Row Styles */
        .active-table-row-mobile {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          gap: 12px;
          margin-bottom: 8px;
          transition: all var(--transition-fast);
        }

        .active-table-row-mobile.set-done {
          background: rgba(16, 185, 129, 0.04);
          border-color: rgba(16, 185, 129, 0.2);
          opacity: 0.7;
        }

        .set-mobile-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
          flex: 1;
        }

        .set-num-badge {
          font-size: 14px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .set-target-desc {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .mobile-set-log-pill {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(139, 92, 246, 0.06);
          border: 1px solid rgba(139, 92, 246, 0.2);
          padding: 10px 16px;
          border-radius: var(--radius-full);
          font-size: 14px;
          font-weight: 700;
          color: var(--accent-violet);
          cursor: pointer;
          transition: all var(--transition-fast);
          min-width: 145px;
        }

        .mobile-set-log-pill:hover {
          background: rgba(139, 92, 246, 0.12);
          border-color: var(--accent-violet);
        }

        .mobile-set-log-pill:disabled {
          background: rgba(255, 255, 255, 0.02);
          border-color: var(--border-light);
          color: var(--text-secondary);
          cursor: not-allowed;
        }

        .pill-divider {
          opacity: 0.4;
          font-weight: 400;
        }

        .checkbox-cell-mobile {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Mobile Horizontal Rest Banner */
        .mobile-horizontal-rest {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 12px;
        }

        .rest-info-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
        }

        .rest-details {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }

        .rest-title-lbl {
          font-size: 10px;
          font-weight: 800;
          color: var(--accent-cyan);
          letter-spacing: 0.05em;
        }

        .rest-next-lbl {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 130px;
        }

        .rest-counter-val {
          font-family: var(--font-headings);
          font-size: 20px;
          font-weight: 800;
          color: var(--text-primary);
          display: flex;
          align-items: baseline;
          gap: 2px;
        }

        .rest-counter-val .sec-lbl {
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .rest-actions-group {
          display: flex;
          gap: 8px;
        }

        .compact-btn {
          height: 36px;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Bottom Sheet Stacking Context Fixes */
        body.bottom-sheet-open .main-content {
          position: relative;
          z-index: 2000 !important;
        }
        body.bottom-sheet-open .sidebar-container {
          z-index: 10 !important;
        }
        body.bottom-sheet-open .mobile-top-bar {
          z-index: 10 !important;
        }

        /* Bottom Sheet Modal */
        .bottom-sheet-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 2100;
          animation: fadeIn 0.3s ease-out;
        }

        .bottom-sheet-content {
          width: 100%;
          max-width: 500px;
          background: var(--bg-card-solid);
          border-top: 1px solid var(--border-medium);
          border-left: 1px solid var(--border-medium);
          border-right: 1px solid var(--border-medium);
          border-bottom: none;
          border-top-left-radius: var(--radius-lg);
          border-top-right-radius: var(--radius-lg);
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          padding: 30px 24px calc(30px + env(safe-area-inset-bottom, 0px)) 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
          animation: slideUpSheet 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .bottom-sheet-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 16px;
          position: relative;
          text-align: left;
        }

        .bottom-sheet-header h3 {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .bottom-sheet-header p {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .btn-close-sheet {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          transition: color var(--transition-fast);
        }

        .btn-close-sheet:hover {
          color: var(--text-primary);
        }

        /* Slider Controls */
        .slider-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          text-align: left;
        }

        .slider-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .slider-value-display {
          color: var(--accent-violet);
        }

        .slider-value-display strong {
          font-size: 20px;
          font-weight: 800;
          font-family: var(--font-headings);
        }

        .slider-control-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .btn-icon-small {
          width: 48px;
          height: 40px;
          padding: 0;
          font-size: 13px;
          border-radius: var(--radius-sm);
          font-weight: 700;
        }

        .touch-slider {
          flex: 1;
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.05);
          outline: none;
          border: 1px solid var(--border-light);
        }

        .touch-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--gradient-primary);
          cursor: pointer;
          box-shadow: 0 0 10px var(--accent-violet-glow);
          border: 2px solid #fff;
          transition: transform 0.1s;
        }

        .touch-slider::-webkit-slider-thumb:active {
          transform: scale(1.2);
        }

        .sheet-actions {
          margin-top: 10px;
        }

        /* V2 - Celebration & Confetti styling */
        .celebration-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(9, 10, 15, 0.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
          overflow: hidden;
          animation: fadeIn 0.3s ease-out;
        }

        .celebration-card {
          max-width: 440px;
          width: 100%;
          padding: 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          position: relative;
          box-shadow: 0 0 45px rgba(139, 92, 246, 0.3);
          border: 1px solid var(--accent-violet);
        }

        .pr-congrats-title {
          font-family: var(--font-headings);
          font-size: 26px;
          font-weight: 800;
          line-height: 1.2;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .pr-trophy {
          font-size: 54px;
          animation: bounceTrophy 1.2s infinite alternate ease-in-out;
        }

        @keyframes bounceTrophy {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-12px) scale(1.08); }
        }

        .pr-broken-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          margin: 10px 0;
          max-height: 200px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .pr-broken-item {
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-light);
          padding: 12px;
          border-radius: var(--radius-md);
          text-align: left;
        }

        .pr-item-name {
          font-weight: 700;
          font-size: 14px;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .pr-item-stats {
          font-size: 12px;
          color: var(--accent-pink);
          font-weight: 600;
        }

        /* Confetti particles */
        .confetti-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 14px;
          border-radius: 2px;
          opacity: 0.85;
          animation: fallConfetti 3.2s infinite linear;
        }

        @keyframes fallConfetti {
          0% { transform: translateY(-20px) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(360deg); }
        }
      `}</style>

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
            <span className="pr-trophy">🏆</span>
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
                  <strong>{exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualWeight ?? exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].weight}</strong> kg
                </span>
              </div>
              <div className="slider-control-row">
                <button 
                  className="btn btn-secondary btn-icon-small"
                  onClick={() => {
                    const current = exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualWeight ?? exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].weight;
                    handleActualChange(activeSetEdit.exIdx, activeSetEdit.setIdx, 'actualWeight', Math.max(0, current - 2.5));
                  }}
                >
                  -2.5
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="300" 
                  step="2.5" 
                  value={exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualWeight ?? exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].weight}
                  onChange={(e) => handleActualChange(activeSetEdit.exIdx, activeSetEdit.setIdx, 'actualWeight', parseFloat(e.target.value))}
                  className="touch-slider"
                />
                <button 
                  className="btn btn-secondary btn-icon-small"
                  onClick={() => {
                    const current = exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualWeight ?? exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].weight;
                    handleActualChange(activeSetEdit.exIdx, activeSetEdit.setIdx, 'actualWeight', current + 2.5);
                  }}
                >
                  +2.5
                </button>
              </div>
            </div>

            {/* Reps Slider Picker */}
            <div className="slider-group">
              <div className="slider-label-row">
                <span>Tekrar:</span>
                <span className="slider-value-display">
                  <strong>{exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualReps ?? exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].reps}</strong> tekrar
                </span>
              </div>
              <div className="slider-control-row">
                <button 
                  className="btn btn-secondary btn-icon-small"
                  onClick={() => {
                    const current = exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualReps ?? exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].reps;
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
                  value={exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualReps ?? exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].reps}
                  onChange={(e) => handleActualChange(activeSetEdit.exIdx, activeSetEdit.setIdx, 'actualReps', parseInt(e.target.value))}
                  className="touch-slider"
                />
                <button 
                  className="btn btn-secondary btn-icon-small"
                  onClick={() => {
                    const current = exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualReps ?? exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].reps;
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
                  <strong>RIR {exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualRir ?? exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].rir ?? 2}</strong>
                </span>
              </div>
              <div className="slider-control-row">
                <button 
                  className="btn btn-secondary btn-icon-small"
                  onClick={() => {
                    const current = exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualRir ?? exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].rir ?? 2;
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
                  value={exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualRir ?? exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].rir ?? 2}
                  onChange={(e) => handleActualChange(activeSetEdit.exIdx, activeSetEdit.setIdx, 'actualRir', parseInt(e.target.value))}
                  className="touch-slider"
                />
                <button 
                  className="btn btn-secondary btn-icon-small"
                  onClick={() => {
                    const current = exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].actualRir ?? exercises[activeSetEdit.exIdx].sets[activeSetEdit.setIdx].rir ?? 2;
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
