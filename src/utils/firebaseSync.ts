import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import type { Exercise, WorkoutProgram, CompletedWorkout, WeightLog, PersonalRecord } from '../types';
import { INITIAL_PROGRAMS } from './localStorage';

// Helper to strip undefined values so Firestore does not throw errors
const toFirestoreData = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
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


