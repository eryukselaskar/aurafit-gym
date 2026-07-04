import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProgramBuilder } from './components/ProgramBuilder';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { ActiveWorkout } from './components/ActiveWorkout';
import { Explore } from './components/Explore';
import { auth, signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, db, signInWithCredential } from './utils/firebase';
import type { User } from './utils/firebase';
import { getRedirectResult } from 'firebase/auth';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { Capacitor } from '@capacitor/core';
import { LoginScreen } from './components/LoginScreen';
import { Profile } from './components/Profile';
import {
  syncSaveExercise,
  syncPrograms,
  syncSaveProgram,
  syncDeleteProgram,
  syncHistory,
  syncSaveHistory,
  syncDeleteHistory,
  syncSaveWeightLog,
  syncDeleteWeightLog,
  syncSavePersonalRecord,
  publishProgramToHub,
  fetchPublicPrograms,
  upvotePublicProgram
} from './utils/firebaseSync';
import {
  getExercises,
  saveExercises,
  getPrograms,
  savePrograms,
  getHistory,
  saveHistory,
  getWeightLogs,
  saveWeightLogs,
  getPersonalRecords,
  savePersonalRecords,
  INITIAL_EXERCISES,
  INITIAL_PROGRAMS,
  getPublicPrograms,
  savePublicPrograms
} from './utils/localStorage';
import { collection, onSnapshot } from 'firebase/firestore';
import type { ActiveTab, Exercise, WorkoutProgram, CompletedWorkout, WeightLog, PersonalRecord, PublicProgram, WorkoutSession } from './types';
import { Sparkles, X, Play } from 'lucide-react';


function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    try {
      const saved = localStorage.getItem('aurafit_workout_active_state');
      return saved ? 'active' : 'dashboard';
    } catch (e) {
      return 'dashboard';
    }
  });
  const [exercises, setExercises] = useState<Exercise[]>(() => getExercises());
  const [programs, setPrograms] = useState<WorkoutProgram[]>(() => getPrograms());
  const [history, setHistory] = useState<CompletedWorkout[]>(() => getHistory());
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(() => getWeightLogs());
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(() => getPersonalRecords());
  const [publicPrograms, setPublicPrograms] = useState<PublicProgram[]>(() => getPublicPrograms());
  
  // Firebase Auth states
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWaitingForBrowser, setIsWaitingForBrowser] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [continueAsGuest, setContinueAsGuest] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aurafit_continue_as_guest') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [avatarError, setAvatarError] = useState(false);

  // Active workout tracking states
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('aurafit_workout_active_state') !== null;
    } catch (e) {
      return false;
    }
  });
  const [activeProgram, setActiveProgram] = useState<WorkoutProgram | null>(() => {
    try {
      const saved = localStorage.getItem('aurafit_workout_active_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.activeProgram || null;
      }
    } catch (e) {}
    return null;
  });
  const [sessionSelectProgram, setSessionSelectProgram] = useState<WorkoutProgram | null>(null);

  const [profileSubTab, setProfileSubTab] = useState<'account' | 'history' | 'metrics'>('account');


  // Fallback to local storage (offline database)
  const loadLocalStorageFallback = () => {
    console.warn("Falling back to local storage (offline database).");
    setExercises(getExercises());
    setPrograms(getPrograms());
    setHistory(getHistory());
    setWeightLogs(getWeightLogs());
    setPersonalRecords(getPersonalRecords());
    setPublicPrograms(getPublicPrograms());
    setIsLoading(false);
  };

  // Bind Firebase Auth session
  useEffect(() => {
    // Safety timer: If connection takes longer than 4.5 seconds (offline or console configuration issue),
    // we automatically trigger the fallback so the user is never locked out of the app.
    const fallbackTimeout = setTimeout(() => {
      if (isLoading && !userId) {
        console.warn("Firebase Auth connection timed out. Booting offline database.");
        loadLocalStorageFallback();
      }
    }, 4500);

    // Capture Redirect result on mount for mobile WebView environments
    const isCapacitor = Capacitor.isNativePlatform();
    if (isCapacitor) {
      try {
        GoogleSignIn.initialize({
          clientId: '586826078940-5k5rk5sk8ernvn9chli24j62no3qpfvu.apps.googleusercontent.com'
        });
      } catch (e) {
        console.warn("Failed to initialize GoogleSignIn:", e);
      }
      getRedirectResult(auth)
        .then((result) => {
          if (result) {
            console.log("Logged in via Google redirect:", result.user);
            setCurrentUser(result.user);
            setUserId(result.user.uid);
          }
        })
        .catch((err) => {
          console.error("Firebase redirect login failed:", err);
        });
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(fallbackTimeout);
      if (user) {
        setCurrentUser(user);
        setUserId(user.uid);
      } else {
        setCurrentUser(null);
        try {
          const credentials = await signInAnonymously(auth);
          setCurrentUser(credentials.user);
          setUserId(credentials.user.uid);
        } catch (err) {
          console.error("Firebase Anonymous Auth failed:", err);
          loadLocalStorageFallback();
        }
      }
    });

    return () => {
      clearTimeout(fallbackTimeout);
      unsubscribe();
    };
  }, []);

  // Register Electron external browser auth callback
  useEffect(() => {
    (window as any).handleExternalAuth = async (credentials: {
      uid: string;
      email: string;
      displayName: string | null;
      photoURL: string | null;
      idToken: string;
    }) => {
      try {
        setIsLoading(true);
        setIsWaitingForBrowser(false);
        console.log("External browser login callback triggered. Logging in with credential...");
        
        // Capture local guest data BEFORE logging in (for in-memory backup)
        const guestExercises = [...exercises];
        const guestPrograms = [...programs];
        const guestHistory = [...history];
        const guestWeightLogs = [...weightLogs];
        const guestPRs = [...personalRecords];

        const credential = GoogleAuthProvider.credential(credentials.idToken);
        const authResult = await signInWithCredential(auth, credential);
        const resultUser = authResult.user;

        console.log("Logged in with external Google credential:", resultUser);

        // Perform post-login database sync/migration
        const newUid = resultUser.uid;
        const cloudProg = await syncPrograms(newUid);
        const cloudHist = await syncHistory(newUid);

        const isCloudNew = cloudProg.filter(p => p.id !== 'prog-ppl-bundle').length === 0 && cloudHist.length === 0;
        const hasLocalData = guestPrograms.filter(p => p.id !== 'prog-ppl-bundle').length > 0 || guestHistory.length > 0 || guestWeightLogs.length > 0;

        if (isCloudNew && hasLocalData) {
          console.log("Migrating local guest data to Google Firestore account...");
          
          // Migrate custom exercises
          const localCustomEx = guestExercises.filter(ex => ex.isCustom);
          for (const ex of localCustomEx) {
            await syncSaveExercise(newUid, ex);
          }

          // Migrate custom programs
          const localCustomProgs = guestPrograms.filter(p => p.id !== 'prog-ppl-bundle');
          for (const prog of localCustomProgs) {
            await syncSaveProgram(newUid, prog);
          }

          // Migrate history
          for (const h of guestHistory) {
            await syncSaveHistory(newUid, h);
          }

          // Migrate weight logs
          for (const log of guestWeightLogs) {
            await syncSaveWeightLog(newUid, log);
          }

          // Migrate personal records
          for (const pr of guestPRs) {
            await syncSavePersonalRecord(newUid, pr);
          }
        }
      } catch (err: any) {
        console.error("External Google Sign-In failed:", err);
        alert("Tarayıcı ile giriş yapılamadı: " + (err.message || err));
      } finally {
        setIsWaitingForBrowser(false);
        setIsLoading(false);
      }
    };

    return () => {
      delete (window as any).handleExternalAuth;
    };
  }, [exercises, programs, history, weightLogs, personalRecords]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const isCapacitor = Capacitor.isNativePlatform();
    try {
      setIsLoading(true);

      // Capture local guest data BEFORE logging in (for in-memory backup)
      const guestExercises = [...exercises];
      const guestPrograms = [...programs];
      const guestHistory = [...history];
      const guestWeightLogs = [...weightLogs];
      const guestPRs = [...personalRecords];

      // Check if we are running in Electron
      const isElectron = /electron/i.test(navigator.userAgent);
      if (isElectron) {
        // Trigger local Electron server to open hosted web app in system browser
        fetch('/api/open-external-browser');
        setIsWaitingForBrowser(true);
        setIsLoading(false);
        return;
      }

      let resultUser;
      if (isCapacitor) {
        // Use native Capawesome Google Sign-in to trigger OS account chooser
        try {
          await GoogleSignIn.initialize({
            clientId: '586826078940-5k5rk5sk8ernvn9chli24j62no3qpfvu.apps.googleusercontent.com'
          });
        } catch (e) {
          console.warn("GoogleSignIn already initialized or failed to re-initialize:", e);
        }
        const result = await GoogleSignIn.signIn();
        if (!result.idToken) {
          throw new Error("Native Google Sign-In returned no ID Token.");
        }
        const credential = GoogleAuthProvider.credential(result.idToken);
        const authResult = await signInWithCredential(auth, credential);
        resultUser = authResult.user;
      } else {
        const authResult = await signInWithPopup(auth, provider);
        resultUser = authResult.user;
      }

      const newUid = resultUser.uid;
      console.log("Logged in with Google:", resultUser);

      // Perform a check to see if this is a fresh account
      const cloudProg = await syncPrograms(newUid);
      const cloudHist = await syncHistory(newUid);

      const isCloudNew = cloudProg.filter(p => p.id !== 'prog-ppl-bundle').length === 0 && cloudHist.length === 0;
      const hasLocalData = guestPrograms.filter(p => p.id !== 'prog-ppl-bundle').length > 0 || guestHistory.length > 0 || guestWeightLogs.length > 0;

      if (isCloudNew && hasLocalData) {
        console.log("Migrating local guest data to Google Firestore account...");
        
        // Migrate custom exercises
        const localCustomEx = guestExercises.filter(ex => ex.isCustom);
        for (const ex of localCustomEx) {
          await syncSaveExercise(newUid, ex);
        }

        // Migrate custom programs
        const localCustomProgs = guestPrograms.filter(p => p.id !== 'prog-ppl-bundle');
        for (const prog of localCustomProgs) {
          await syncSaveProgram(newUid, prog);
        }

        // Migrate history
        for (const h of guestHistory) {
          await syncSaveHistory(newUid, h);
        }

        // Migrate weight logs
        for (const log of guestWeightLogs) {
          await syncSaveWeightLog(newUid, log);
        }

        // Migrate personal records
        for (const pr of guestPRs) {
          await syncSavePersonalRecord(newUid, pr);
        }
      }
    } catch (err: any) {
      console.error("Google Sign-In failed:", err);
      // Suppress alert on user cancellation of native chooser
      const isCancellation = err.message?.includes('canceled') || err.code === '12501' || err.message?.includes('12501');
      if (!isCancellation) {
        alert("Google ile giriş yapılamadı: " + (err.message || err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    const confirmLogout = window.confirm("Çıkış yapmak istediğinize emin misiniz? Çevrimdışı/Misafir moduna geçiş yapacaksınız.");
    if (!confirmLogout) return;
    try {
      setIsLoading(true);

      const isCapacitor = Capacitor.isNativePlatform();
      if (isCapacitor) {
        try {
          await GoogleSignIn.signOut();
        } catch (e) {
          console.warn("Failed to sign out from native Google SDK:", e);
        }
      }

      await signOut(auth);
      
      // Reset local storage to clean slate (defaults) so that the next session starts fresh without data leakage
      localStorage.removeItem('aurafit_exercises');
      localStorage.removeItem('aurafit_programs');
      localStorage.removeItem('aurafit_history');
      localStorage.removeItem('aurafit_weight_logs');
      localStorage.removeItem('aurafit_personal_records');
      localStorage.removeItem('aurafit_workout_active_state');
      
      // Reset React state
      setExercises(INITIAL_EXERCISES);
      setPrograms(INITIAL_PROGRAMS);
      setHistory([]);
      setWeightLogs([]);
      setPersonalRecords([]);

      // Reset guest continuation states
      try {
        localStorage.removeItem('aurafit_continue_as_guest');
      } catch (e) {}
      setContinueAsGuest(false);
    } catch (err) {
      console.error("Sign-Out failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Firestore documents in real-time when userId changes
  useEffect(() => {
    if (!userId) return;

    setIsLoading(true);

    // Track initial synchronization status for local-first merge workflow
    let isExercisesSynced = false;
    let isProgramsSynced = false;
    let isHistorySynced = false;
    let isWeightLogsSynced = false;
    let isPRsSynced = false;

    const unsubExercises = onSnapshot(collection(db, 'users', userId, 'exercises'), (snap) => {
      const cloudExercises = snap.docs.map(d => d.data() as Exercise);
      const cloudCustom = cloudExercises.filter(ex => ex.isCustom);

      if (!isExercisesSynced) {
        isExercisesSynced = true;
        const localExercises = getExercises();
        const localCustom = localExercises.filter(ex => ex.isCustom);

        const mergedMap = new Map<string, Exercise>();
        localCustom.forEach(ex => mergedMap.set(ex.id, ex));
        cloudCustom.forEach(ex => mergedMap.set(ex.id, ex));

        const mergedCustom = Array.from(mergedMap.values());
        const combined = [...mergedCustom, ...INITIAL_EXERCISES];

        // Sync local-only custom exercises to cloud
        const cloudIds = new Set(cloudCustom.map(ex => ex.id));
        localCustom.forEach(async (ex) => {
          if (!cloudIds.has(ex.id)) {
            try {
              await syncSaveExercise(userId, ex);
            } catch (e) {
              console.error("Auto-syncing local exercise to cloud failed:", e);
            }
          }
        });

        setExercises(combined);
        saveExercises(combined);
      } else {
        // Subsequent snapshots: trust cloud as source of truth
        const combined = [...cloudCustom, ...INITIAL_EXERCISES];
        setExercises(combined);
        saveExercises(combined);
      }
    });

    const unsubPrograms = onSnapshot(collection(db, 'users', userId, 'programs'), (snap) => {
      const cloudPrograms = snap.docs.map(d => d.data() as WorkoutProgram);

      if (!isProgramsSynced) {
        isProgramsSynced = true;
        const localPrograms = getPrograms();

        const mergedMap = new Map<string, WorkoutProgram>();
        // 1. Start with initial programs as base templates
        INITIAL_PROGRAMS.forEach(p => mergedMap.set(p.id, p));
        // 2. Apply offline local modifications
        localPrograms.forEach(p => mergedMap.set(p.id, p));
        // 3. Apply online cloud modifications
        cloudPrograms.forEach(p => mergedMap.set(p.id, p));

        const combined = Array.from(mergedMap.values());

        // Sync local-only or updated programs to cloud
        const cloudIds = new Set(cloudPrograms.map(p => p.id));
        localPrograms.forEach(async (p) => {
          if (!cloudIds.has(p.id)) {
            try {
              await syncSaveProgram(userId, p);
            } catch (e) {
              console.error("Auto-syncing local program to cloud failed:", e);
            }
          }
        });

        setPrograms(combined);
        savePrograms(combined);
      } else {
        // Subsequent snapshots: trust cloud as source of truth, keeping defaults if not customized in cloud
        const mergedMap = new Map<string, WorkoutProgram>();
        INITIAL_PROGRAMS.forEach(p => mergedMap.set(p.id, p));
        cloudPrograms.forEach(p => mergedMap.set(p.id, p));

        const combined = Array.from(mergedMap.values());
        setPrograms(combined);
        savePrograms(combined);
      }
    });

    const unsubHistory = onSnapshot(collection(db, 'users', userId, 'history'), (snap) => {
      const cloudHistory = snap.docs.map(d => d.data() as CompletedWorkout);

      if (!isHistorySynced) {
        isHistorySynced = true;
        const localHistory = getHistory();

        const mergedMap = new Map<string, CompletedWorkout>();
        localHistory.forEach(h => mergedMap.set(h.id, h));
        cloudHistory.forEach(h => mergedMap.set(h.id, h));

        const combined = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Sync local-only history to cloud
        const cloudIds = new Set(cloudHistory.map(h => h.id));
        localHistory.forEach(async (h) => {
          if (!cloudIds.has(h.id)) {
            try {
              await syncSaveHistory(userId, h);
            } catch (e) {
              console.error("Auto-syncing local history to cloud failed:", e);
            }
          }
        });

        setHistory(combined);
        saveHistory(combined);
      } else {
        // Subsequent snapshots: trust cloud as source of truth
        const combined = [...cloudHistory].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setHistory(combined);
        saveHistory(combined);
      }
    });

    const unsubWeightLogs = onSnapshot(collection(db, 'users', userId, 'weightLogs'), (snap) => {
      const cloudWeightLogs = snap.docs.map(d => d.data() as WeightLog);

      if (!isWeightLogsSynced) {
        isWeightLogsSynced = true;
        const localWeightLogs = getWeightLogs();

        const mergedMap = new Map<string, WeightLog>();
        localWeightLogs.forEach(log => mergedMap.set(log.id, log));
        cloudWeightLogs.forEach(log => mergedMap.set(log.id, log));

        const combined = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Sync local-only weight logs to cloud
        const cloudIds = new Set(cloudWeightLogs.map(log => log.id));
        localWeightLogs.forEach(async (log) => {
          if (!cloudIds.has(log.id)) {
            try {
              await syncSaveWeightLog(userId, log);
            } catch (e) {
              console.error("Auto-syncing local weight log to cloud failed:", e);
            }
          }
        });

        setWeightLogs(combined);
        saveWeightLogs(combined);
      } else {
        // Subsequent snapshots: trust cloud as source of truth
        const combined = [...cloudWeightLogs].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setWeightLogs(combined);
        saveWeightLogs(combined);
      }
    });

    const unsubPRs = onSnapshot(collection(db, 'users', userId, 'personalRecords'), (snap) => {
      const cloudPRs = snap.docs.map(d => d.data() as PersonalRecord);

      if (!isPRsSynced) {
        isPRsSynced = true;
        const localPRs = getPersonalRecords();

        const mergedMap = new Map<string, PersonalRecord>();
        localPRs.forEach(pr => mergedMap.set(pr.exerciseId, pr));
        cloudPRs.forEach(pr => mergedMap.set(pr.exerciseId, pr));

        const combined = Array.from(mergedMap.values());

        // Sync local-only personal records to cloud
        const cloudIds = new Set(cloudPRs.map(pr => pr.exerciseId));
        localPRs.forEach(async (pr) => {
          if (!cloudIds.has(pr.exerciseId)) {
            try {
              await syncSavePersonalRecord(userId, pr);
            } catch (e) {
              console.error("Auto-syncing local personal record to cloud failed:", e);
            }
          }
        });

        setPersonalRecords(combined);
        savePersonalRecords(combined);
      } else {
        // Subsequent snapshots: trust cloud as source of truth
        setPersonalRecords(cloudPRs);
        savePersonalRecords(cloudPRs);
      }
    });

    const unsubPublic = onSnapshot(collection(db, 'public_programs'), (snap) => {
      const docs = snap.docs.map(d => d.data() as PublicProgram);
      setPublicPrograms(docs);
      savePublicPrograms(docs);
    });

    // Turn off loading once initial cache subscription connects (600ms)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => {
      unsubExercises();
      unsubPrograms();
      unsubHistory();
      unsubWeightLogs();
      unsubPRs();
      unsubPublic();
      clearTimeout(timer);
    };
  }, [userId]);


  // Exercise Handlers
  const handleAddExercise = async (newEx: Omit<Exercise, 'id'>) => {
    const exerciseWithId: Exercise = {
      ...newEx,
      id: `ex-custom-${Date.now()}`
    };
    
    const updated = [...exercises, exerciseWithId];
    setExercises(updated);
    saveExercises(updated); // Always update local cache

    if (userId) {
      try {
        await syncSaveExercise(userId, exerciseWithId);
      } catch (err) {
        console.error("Failed to sync exercise to Cloud:", err);
      }
    }
  };

  // Program Handlers
  const handleSaveProgram = async (program: WorkoutProgram) => {
    const exists = programs.some(p => p.id === program.id);
    let updated: WorkoutProgram[];
    if (exists) {
      updated = programs.map(p => p.id === program.id ? program : p);
    } else {
      updated = [...programs, program];
    }
    
    setPrograms(updated);
    savePrograms(updated); // Always update local cache

    if (userId) {
      try {
        await syncSaveProgram(userId, program);
      } catch (err) {
        console.error("Failed to sync program to Cloud:", err);
      }
    }
  };

  const handleDeleteProgram = async (id: string) => {
    const updated = programs.filter(p => p.id !== id);
    setPrograms(updated);
    savePrograms(updated); // Always update local cache

    if (userId) {
      try {
        await syncDeleteProgram(userId, id);
      } catch (err) {
        console.error("Failed to delete program from Cloud:", err);
      }
    }
  };

  // Active Session Handlers
  const handleStartWorkout = (program: WorkoutProgram, session?: WorkoutSession) => {
    if (isWorkoutActive) {
      const confirmSwitch = window.confirm(
        'Zaten devam eden bir antrenmanınız var. Mevcut olanı iptal edip yenisine başlamak istiyor musunuz?'
      );
      if (!confirmSwitch) return;
    }

    if (!session && program.sessions && program.sessions.length > 0) {
      setSessionSelectProgram(program);
      return;
    }

    let programToStart = program;
    if (session) {
      programToStart = {
        id: `${program.id}-${session.id}`,
        name: `${program.name} - ${session.name}`,
        description: program.description,
        exercises: session.exercises,
        createdAt: program.createdAt
      };
    }

    setActiveProgram(programToStart);
    setIsWorkoutActive(true);
    setActiveTab('active');
    setSessionSelectProgram(null);
  };


  const handleFinishWorkout = async (completedWorkout: CompletedWorkout, newPRs: PersonalRecord[]) => {
    try {
      localStorage.removeItem('aurafit_workout_active_state');
    } catch (e) {}
    const updatedHistory = [...history, completedWorkout];
    
    setHistory(updatedHistory);
    saveHistory(updatedHistory); // Always update local cache
    setIsWorkoutActive(false);
    setActiveProgram(null);
    setActiveTab('dashboard');

    // Auto-save progressive overload changes back to the original program
    let originalProgramId = completedWorkout.programId;
    let sessionId: string | null = null;
    let originalProgram = programs.find(p => p.id === originalProgramId);
    
    if (!originalProgram) {
      for (const p of programs) {
        if (p.sessions && p.sessions.length > 0) {
          for (const s of p.sessions) {
            if (completedWorkout.programId === `${p.id}-${s.id}`) {
              originalProgram = p;
              originalProgramId = p.id;
              sessionId = s.id;
              break;
            }
          }
        }
        if (originalProgram) break;
      }
    }

    if (originalProgram) {
      const updatedPrograms = programs.map(p => {
        if (p.id !== originalProgramId) return p;
        const clonedProgram = { ...p };
        
        if (sessionId && clonedProgram.sessions) {
          clonedProgram.sessions = clonedProgram.sessions.map(s => {
            if (s.id !== sessionId) return s;
            const updatedExercises = s.exercises.map(progEx => {
              const completedEx = completedWorkout.exercises.find(
                ex => ex.exerciseId === progEx.exerciseId
              );
              if (!completedEx) return progEx;
              
              const updatedSets = progEx.sets.map((progSet, setIdx) => {
                const compSet = completedEx.sets[setIdx];
                if (compSet && compSet.completed) {
                  return {
                    ...progSet,
                    weight: compSet.actualWeight ?? compSet.weight,
                    reps: compSet.actualReps ?? compSet.reps,
                    rir: compSet.actualRir !== undefined ? compSet.actualRir : progSet.rir
                  };
                }
                return progSet;
              });
              return { ...progEx, sets: updatedSets };
            });
            return { ...s, exercises: updatedExercises };
          });
        } else {
          clonedProgram.exercises = clonedProgram.exercises.map(progEx => {
            const completedEx = completedWorkout.exercises.find(
              ex => ex.exerciseId === progEx.exerciseId
            );
            if (!completedEx) return progEx;
            
            const updatedSets = progEx.sets.map((progSet, setIdx) => {
              const compSet = completedEx.sets[setIdx];
              if (compSet && compSet.completed) {
                return {
                  ...progSet,
                  weight: compSet.actualWeight ?? compSet.weight,
                  reps: compSet.actualReps ?? compSet.reps,
                  rir: compSet.actualRir !== undefined ? compSet.actualRir : progSet.rir
                };
              }
              return progSet;
            });
            return { ...progEx, sets: updatedSets };
          });
        }
        return clonedProgram;
      });

      setPrograms(updatedPrograms);
      savePrograms(updatedPrograms);

      if (userId) {
        const updatedProgramObj = updatedPrograms.find(p => p.id === originalProgramId);
        if (updatedProgramObj) {
          try {
            await syncSaveProgram(userId, updatedProgramObj);
          } catch (err) {
            console.error("Failed to sync auto-progression program to cloud:", err);
          }
        }
      }
    }

    if (userId) {
      try {
        await syncSaveHistory(userId, completedWorkout);
      } catch (err) {
        console.error("Failed to sync completed workout to Cloud:", err);
      }
    }

    if (newPRs.length > 0) {
      const updatedPRs = [...personalRecords];
      newPRs.forEach(newPr => {
        const idx = updatedPRs.findIndex(pr => pr.exerciseId === newPr.exerciseId);
        if (idx !== -1) {
          updatedPRs[idx] = newPr;
        } else {
          updatedPRs.push(newPr);
        }
      });
      setPersonalRecords(updatedPRs);
      savePersonalRecords(updatedPRs); // Always update local cache

      if (userId) {
        try {
          const savePromises = newPRs.map(pr => syncSavePersonalRecord(userId, pr));
          await Promise.all(savePromises);
        } catch (err) {
          console.error("Failed to sync personal records to Cloud:", err);
        }
      }
    }
  };

  const handleCancelWorkout = () => {
    try {
      localStorage.removeItem('aurafit_workout_active_state');
    } catch (e) {}
    setIsWorkoutActive(false);
    setActiveProgram(null);
    setActiveTab('programs');
  };

  // Metrics Tracker Handlers
  const handleAddWeightLog = async (newLog: Omit<WeightLog, 'id'>) => {
    const logWithId: WeightLog = {
      ...newLog,
      id: `log-weight-${Date.now()}`
    };
    const updated = [logWithId, ...weightLogs];
    setWeightLogs(updated);
    saveWeightLogs(updated); // Always update local cache

    if (userId) {
      try {
        await syncSaveWeightLog(userId, logWithId);
      } catch (err) {
        console.error("Failed to sync weight log to Cloud:", err);
      }
    }
  };

  const handleDeleteWeightLog = async (id: string) => {
    const updated = weightLogs.filter(log => log.id !== id);
    setWeightLogs(updated);
    saveWeightLogs(updated); // Always update local cache

    if (userId) {
      try {
        await syncDeleteWeightLog(userId, id);
      } catch (err) {
        console.error("Failed to delete weight log from Cloud:", err);
      }
    }
  };

  // Social Explore Feed Handlers
  const handlePublishProgram = async (program: WorkoutProgram, creatorName: string) => {
    if (!userId) {
      throw new Error("Paylaşım yapabilmek için internet bağlantısı gereklidir.");
    }
    
    const publicProgId = `public-${program.id}-${userId}`;
    const newPublicProg: PublicProgram = {
      id: publicProgId,
      originalProgramId: program.id,
      name: program.name,
      description: program.description,
      exercises: program.exercises || [],
      sessions: program.sessions || [],
      creatorId: userId,
      creatorName,
      upvotes: 0,
      upvotedBy: [],
      createdAt: new Date().toISOString()
    };

    // Optimistically update local state & cache
    setPublicPrograms(prev => {
      const updated = [newPublicProg, ...prev.filter(p => p.id !== publicProgId)];
      savePublicPrograms(updated);
      return updated;
    });

    await publishProgramToHub(program, creatorName, userId);
    
    // Reload public programs
    try {
      const updatedPublic = await fetchPublicPrograms();
      setPublicPrograms(updatedPublic);
      savePublicPrograms(updatedPublic);
    } catch (err) {
      console.error("Failed to refresh public programs list:", err);
    }
  };

  const handleUpvoteProgram = async (programId: string) => {
    if (!userId) return;
    // Optimistic toggle
    setPublicPrograms(prev => prev.map(p => {
      if (p.id === programId) {
        const upvotedBy = p.upvotedBy || [];
        const hasUpvoted = upvotedBy.includes(userId);
        return {
          ...p,
          upvotes: hasUpvoted ? p.upvotes - 1 : p.upvotes + 1,
          upvotedBy: hasUpvoted ? upvotedBy.filter(uid => uid !== userId) : [...upvotedBy, userId]
        };
      }
      return p;
    }));

    try {
      await upvotePublicProgram(programId, userId);
    } catch (err) {
      console.error("Upvote sync failed, reloading:", err);
      try {
        const refreshed = await fetchPublicPrograms();
        setPublicPrograms(refreshed);
      } catch (e) {
        console.error("Error refreshing after failed upvote:", e);
      }
    }
  };

  const handleImportProgram = (publicProg: PublicProgram) => {
    const importedProg: WorkoutProgram = {
      id: `prog-imported-${Date.now()}`,
      name: publicProg.name,
      description: `Topluluktan kopyalandı (Yazar: ${publicProg.creatorName})`,
      exercises: (publicProg.exercises || []).map(ex => ({
        ...ex,
        id: `ex-imported-${Date.now()}-${Math.random()}`
      })),
      sessions: publicProg.sessions ? publicProg.sessions.map(s => ({
        ...s,
        exercises: s.exercises.map(ex => ({
          ...ex,
          id: `ex-imported-${Date.now()}-${Math.random()}`
        }))
      })) : undefined,
      createdAt: new Date().toISOString()
    };
    handleSaveProgram(importedProg);
  };

  // History Handlers
  const handleDeleteHistoryItem = async (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    saveHistory(updated); // Always update local cache

    if (userId) {
      try {
        await syncDeleteHistory(userId, id);
      } catch (err) {
        console.error("Failed to delete history item from Cloud:", err);
      }
    }
  };

  // Page switcher
  const renderActiveTab = () => {
    return (
      <>
        <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
          <Dashboard
            history={history}
            programs={programs}
            personalRecords={personalRecords}
            weightLogs={weightLogs}
            startWorkout={handleStartWorkout}
            setActiveTab={(tab) => setActiveTab(tab as ActiveTab)}
            setProfileSubTab={setProfileSubTab}
          />
        </div>
        
        <div style={{ display: activeTab === 'programs' ? 'block' : 'none' }}>
          <ProgramBuilder
            programs={programs}
            exercises={exercises}
            saveProgram={handleSaveProgram}
            deleteProgram={handleDeleteProgram}
            startWorkout={handleStartWorkout}
          />
        </div>

        <div style={{ display: activeTab === 'exercises' ? 'block' : 'none' }}>
          <ExerciseLibrary
            exercises={exercises}
            addExercise={handleAddExercise}
            personalRecords={personalRecords}
            history={history}
          />
        </div>

        <div style={{ display: activeTab === 'explore' ? 'block' : 'none' }}>
          <Explore
            publicPrograms={publicPrograms}
            personalPrograms={programs}
            userId={userId}
            publishProgram={handlePublishProgram}
            upvoteProgram={handleUpvoteProgram}
            importProgram={handleImportProgram}
          />
        </div>

        <div style={{ display: activeTab === 'profile' ? 'block' : 'none' }}>
          <Profile
            currentUser={currentUser}
            onGoogleSignIn={handleGoogleSignIn}
            onSignOut={handleSignOut}
            isLoading={isLoading}
            history={history}
            deleteHistoryItem={handleDeleteHistoryItem}
            weightLogs={weightLogs}
            addWeightLog={handleAddWeightLog}
            deleteWeightLog={handleDeleteWeightLog}
            activeSubTab={profileSubTab}
            setActiveSubTab={setProfileSubTab}
          />
        </div>

        <div style={{ display: activeTab === 'active' ? 'block' : 'none' }}>
          {isWorkoutActive && activeProgram ? (
            <ActiveWorkout
              activeProgram={activeProgram}
              finishWorkout={handleFinishWorkout}
              cancelWorkout={handleCancelWorkout}
              personalRecords={personalRecords}
              history={history}
            />
          ) : (
            <div className="empty-programs-prompt glass-panel" style={{ padding: '60px', marginTop: '40px' }}>
              <h2>Aktif Antrenman Bulunmuyor</h2>
              <p>Antrenman seansınızı başlatmak için "Programlarım" sekmesinden bir program seçin.</p>
              <button onClick={() => setActiveTab('programs')} className="btn btn-primary" style={{ marginTop: '20px' }}>
                Programları Gör
              </button>
            </div>
          )}
        </div>
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="cloud-loading-screen">
        <div className="loading-card glass-panel anim-slide-up">
          <Sparkles className="logo-icon loading-pulse-glow" size={48} />
          <h2 className="loading-title gradient-text">AuraFit Cloud</h2>
          <p className="loading-subtitle">Veritabanınız güvenli bir şekilde eşitleniyor...</p>
        </div>
        <style>{`
          .cloud-loading-screen {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: var(--bg-primary);
            background: radial-gradient(circle at center, rgba(139, 92, 246, 0.12) 0%, transparent 60%);
          }
          .loading-card {
            padding: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            max-width: 360px;
            text-align: center;
          }
          .loading-pulse-glow {
            color: var(--accent-violet);
            filter: drop-shadow(0 0 15px var(--accent-violet-glow));
            animation: pulseGlow 1.8s infinite ease-in-out;
          }
          @keyframes pulseGlow {
            0% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.15); opacity: 1; filter: drop-shadow(0 0 25px var(--accent-violet-glow)); }
            100% { transform: scale(1); opacity: 0.7; }
          }
          .loading-title {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.02em;
          }
          .loading-subtitle {
            color: var(--text-secondary);
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  const isUserLoggedInWithGoogle = currentUser && !currentUser.isAnonymous;
  const showLoginScreen = !isUserLoggedInWithGoogle && !continueAsGuest;

  if (showLoginScreen) {
    return (
      <LoginScreen
        onGoogleSignIn={handleGoogleSignIn}
        onGuestContinue={() => {
          try {
            localStorage.setItem('aurafit_continue_as_guest', 'true');
          } catch (e) {
            console.warn("Storage write failed:", e);
          }
          setContinueAsGuest(true);
        }}
        isLoading={isLoading}
        isWaitingForBrowser={isWaitingForBrowser}
        onCancelWaiting={() => {
          setIsWaitingForBrowser(false);
          setIsLoading(false);
        }}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Mobile Top Bar */}
      <div className="mobile-top-bar glass-panel">
        <div className="mobile-logo">
          <Sparkles className="logo-icon" size={20} />
          <span className="logo-text gradient-text">AuraFit</span>
        </div>
        <div className="mobile-avatar-btn" onClick={() => setActiveTab('profile')}>
          {currentUser && !currentUser.isAnonymous && currentUser.photoURL && !avatarError ? (
            <img 
              src={currentUser.photoURL} 
              alt="Avatar" 
              className="mobile-avatar" 
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="mobile-avatar">
              {currentUser && !currentUser.isAnonymous && currentUser.displayName
                ? currentUser.displayName[0].toUpperCase()
                : 'M'
              }
            </div>
          )}
        </div>
      </div>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isWorkoutActive={isWorkoutActive}
        currentUser={currentUser}
      />
      <main className="main-content">
        {renderActiveTab()}
      </main>

      {/* Session Selector Modal */}
      {sessionSelectProgram && (
        <div className="modal-backdrop" style={{ zIndex: 1100 }}>
          <div className="modal-content glass-panel anim-slide-up" style={{ maxWidth: '420px', padding: '24px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 className="modal-title" style={{ fontSize: '20px', fontWeight: 800 }}>Gün Seçin</h2>
                <p className="modal-subtitle" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{sessionSelectProgram.name}</p>
              </div>
              <button onClick={() => setSessionSelectProgram(null)} className="modal-close-btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="selector-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sessionSelectProgram.sessions?.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleStartWorkout(sessionSelectProgram, session)}
                  className="selector-item"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '14px 18px',
                    gap: '4px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="selector-item-name" style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{session.name}</span>
                    <Play size={14} fill="currentColor" style={{ color: 'var(--accent-violet)' }} />
                  </div>
                  <span className="badge badge-cyan" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    {session.exercises.length} Egzersiz | {session.exercises.reduce((sum, e) => sum + e.sets.length, 0)} Set
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal has been migrated to a dedicated tab page */}
    </div>
  );
}

export default App;
