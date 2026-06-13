import { registerPlugin, Capacitor } from '@capacitor/core';

export interface WorkoutServicePlugin {
  startWorkout(options: { workoutName: string; elapsedSeconds: number }): Promise<void>;
  updateWorkout(options: { workoutName: string; isResting?: boolean; restSecondsLeft?: number }): Promise<void>;
  stopWorkout(): Promise<void>;
  pauseWorkout(): Promise<void>;
  resumeWorkout(options: { elapsedSeconds: number }): Promise<void>;
  requestNotificationPermission(): Promise<{ status: string }>;
}

let WorkoutServiceRaw: WorkoutServicePlugin | null = null;

if (Capacitor.isNativePlatform()) {
  try {
    WorkoutServiceRaw = registerPlugin<WorkoutServicePlugin>('WorkoutService');
  } catch (e) {
    console.error("Failed to register WorkoutService plugin:", e);
  }
}

export const startWorkoutService = async (workoutName: string, elapsedSeconds: number) => {
  if (WorkoutServiceRaw) {
    try {
      await WorkoutServiceRaw.requestNotificationPermission();
      await WorkoutServiceRaw.startWorkout({ workoutName, elapsedSeconds });
    } catch (e) {
      console.warn("Failed to start WorkoutService:", e);
    }
  }
};

export const updateWorkoutService = async (workoutName: string, isResting: boolean = false, restSecondsLeft: number = 0) => {
  if (WorkoutServiceRaw) {
    try {
      await WorkoutServiceRaw.updateWorkout({ workoutName, isResting, restSecondsLeft });
    } catch (e) {
      console.warn("Failed to update WorkoutService:", e);
    }
  }
};

export const stopWorkoutService = async () => {
  if (WorkoutServiceRaw) {
    try {
      await WorkoutServiceRaw.stopWorkout();
    } catch (e) {
      console.warn("Failed to stop WorkoutService:", e);
    }
  }
};

export const pauseWorkoutService = async () => {
  if (WorkoutServiceRaw) {
    try {
      await WorkoutServiceRaw.pauseWorkout();
    } catch (e) {
      console.warn("Failed to pause WorkoutService:", e);
    }
  }
};

export const resumeWorkoutService = async (elapsedSeconds: number) => {
  if (WorkoutServiceRaw) {
    try {
      await WorkoutServiceRaw.resumeWorkout({ elapsedSeconds });
    } catch (e) {
      console.warn("Failed to resume WorkoutService:", e);
    }
  }
};

export const addWorkoutServiceListener = (
  callback: (data: { action: 'pause' | 'resume' | 'finish' }) => void
) => {
  if (WorkoutServiceRaw && Capacitor.isNativePlatform()) {
    try {
      const plugin = WorkoutServiceRaw as any;
      if (plugin.addListener) {
        return plugin.addListener('workoutAction', callback);
      }
    } catch (e) {
      console.error("Failed to add listener to WorkoutService:", e);
    }
  }
  return null;
};
