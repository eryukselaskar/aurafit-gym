import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  arrayUnion,
  arrayRemove,
  increment,
  runTransaction
} from 'firebase/firestore';
import type { Exercise, WorkoutProgram, CompletedWorkout, WeightLog, PersonalRecord, PublicProgram } from '../types';
import { INITIAL_EXERCISES, INITIAL_PROGRAMS } from './localStorage';

// Helper to strip undefined values so Firestore does not throw errors
const toFirestoreData = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const syncExercises = async (userId: string): Promise<Exercise[]> => {
  const colRef = collection(db, 'users', userId, 'exercises');
  const snap = await getDocs(colRef);
  
  const customExercises = snap.docs.map(d => d.data() as Exercise);
  
  // Return custom exercises merged with static defaults to avoid 61 redundant Firestore writes on signup.
  return [...customExercises, ...INITIAL_EXERCISES];
};

export const syncSaveExercise = async (userId: string, exercise: Exercise): Promise<void> => {
  await setDoc(doc(db, 'users', userId, 'exercises', exercise.id), toFirestoreData(exercise));
};

// Helper to fetch or initialize programs
export const syncPrograms = async (userId: string): Promise<WorkoutProgram[]> => {
  const colRef = collection(db, 'users', userId, 'programs');
  const snap = await getDocs(colRef);
  
  if (snap.empty) {
    // Return static template bundle directly to avoid write calls.
    return INITIAL_PROGRAMS;
  }
  
  return snap.docs.map(d => d.data() as WorkoutProgram);
};

export const syncSaveProgram = async (userId: string, program: WorkoutProgram): Promise<void> => {
  await setDoc(doc(db, 'users', userId, 'programs', program.id), toFirestoreData(program));
};

export const syncDeleteProgram = async (userId: string, programId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, 'programs', programId));
};

// Helper to fetch or initialize history
export const syncHistory = async (userId: string): Promise<CompletedWorkout[]> => {
  const colRef = collection(db, 'users', userId, 'history');
  const snap = await getDocs(colRef);
  
  if (snap.empty) {
    return [];
  }
  
  return snap.docs.map(d => d.data() as CompletedWorkout);
};

export const syncSaveHistory = async (userId: string, workout: CompletedWorkout): Promise<void> => {
  await setDoc(doc(db, 'users', userId, 'history', workout.id), toFirestoreData(workout));
};

export const syncDeleteHistory = async (userId: string, workoutId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, 'history', workoutId));
};

// V2 — Weight & Body Metrics Sync
export const syncWeightLogs = async (userId: string): Promise<WeightLog[]> => {
  const colRef = collection(db, 'users', userId, 'weightLogs');
  const snap = await getDocs(colRef);
  return snap.docs.map(d => d.data() as WeightLog);
};

export const syncSaveWeightLog = async (userId: string, log: WeightLog): Promise<void> => {
  await setDoc(doc(db, 'users', userId, 'weightLogs', log.id), toFirestoreData(log));
};

export const syncDeleteWeightLog = async (userId: string, logId: string): Promise<void> => {
  await deleteDoc(doc(db, 'users', userId, 'weightLogs', logId));
};

// V2 — Personal Records (PR) Sync
export const syncPersonalRecords = async (userId: string): Promise<PersonalRecord[]> => {
  const colRef = collection(db, 'users', userId, 'personalRecords');
  const snap = await getDocs(colRef);
  return snap.docs.map(d => d.data() as PersonalRecord);
};

export const syncSavePersonalRecord = async (userId: string, pr: PersonalRecord): Promise<void> => {
  await setDoc(doc(db, 'users', userId, 'personalRecords', pr.exerciseId), toFirestoreData(pr));
};

// V2 — Social Sharing Hub (explore)
export const publishProgramToHub = async (
  program: WorkoutProgram,
  creatorName: string,
  creatorId: string
): Promise<void> => {
  // We use a unique public program ID based on original program ID + creator ID
  const publicProgId = `public-${program.id}-${creatorId}`;
  
  const publicProg: PublicProgram = {
    id: publicProgId,
    originalProgramId: program.id,
    name: program.name,
    description: program.description,
    exercises: program.exercises || [],
    sessions: program.sessions || [],
    creatorId,
    creatorName,
    upvotes: 0,
    upvotedBy: [],
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'public_programs', publicProgId), toFirestoreData(publicProg));
};

export const fetchPublicPrograms = async (): Promise<PublicProgram[]> => {
  const colRef = collection(db, 'public_programs');
  const snap = await getDocs(colRef);
  return snap.docs.map(d => d.data() as PublicProgram);
};

export const upvotePublicProgram = async (programId: string, userId: string): Promise<void> => {
  const docRef = doc(db, 'public_programs', programId);
  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(docRef);
    if (!docSnap.exists()) return;
    
    const data = docSnap.data() as PublicProgram;
    const upvotedBy = data.upvotedBy || [];
    const hasUpvoted = upvotedBy.includes(userId);
    
    if (hasUpvoted) {
      transaction.update(docRef, {
        upvotedBy: arrayRemove(userId),
        upvotes: increment(-1)
      });
    } else {
      transaction.update(docRef, {
        upvotedBy: arrayUnion(userId),
        upvotes: increment(1)
      });
    }
  });
};
