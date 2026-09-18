export interface Exercise {
  id: string;
  name: string;
  category: string; // 'Göğüs', 'Sırt', 'Bacak', 'Omuz', 'Kol', 'Karın', 'Kardiyo' vb.
  description?: string;
  isCustom?: boolean;
}

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
  actualReps?: number;
  actualWeight?: number;
  rir?: number;         // Hedef RIR (Reps in Reserve)
  actualRir?: number;   // Gerçekleşen RIR (Reps in Reserve)
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  category: string;
  sets: WorkoutSet[];
  restTime: number; // saniye cinsinden, örn: 60, 90
  notes?: string; // Egzersiz notu (Koçun Notu vb.)
  minReps?: number; // Minimum hedef tekrar
  maxReps?: number; // Maksimum hedef tekrar
  weight?: number; // Egzersiz seviyesinde hedef ağırlık (opsiyonel)
  rir?: number; // Egzersiz seviyesinde hedef RIR (opsiyonel)
}

export interface WorkoutSession {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  sessions?: WorkoutSession[]; // Çoklu antrenman günleri desteği
  createdAt: string;
  // Split programdan tek gün başlatıldığında doldurulur; aktif antrenman ekranı
  // başlığı "program / gün" olarak iki satırda gösterebilsin diye.
  parentName?: string;
  sessionName?: string;
}

export interface CompletedWorkout {
  id: string;
  programId: string; // 'custom' veya program id'si
  programName: string;
  date: string; // YYYY-MM-DD formatında veya ISO
  duration: number; // dakika cinsinden
  totalVolume: number; // toplam kaldırılan ağırlık (set * reps * weight)
  exercises: WorkoutExercise[];
  notes?: string; // Antrenman sonu notu
}

export type ActiveTab = 'dashboard' | 'programs' | 'active' | 'history' | 'exercises' | 'explore' | 'metrics' | 'profile';

export interface WeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  bodyFat?: number; // %
  chest?: number; // cm
  biceps?: number; // cm
  waist?: number; // cm
  thigh?: number; // cm
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  maxReps: number;
  oneRepMax: number;
  date: string;
}

export interface PublicProgram {
  id: string;
  originalProgramId: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  sessions?: WorkoutSession[]; // Support multi-day splits in shared hub
  creatorId: string;
  creatorName: string;
  upvotes: number;
  upvotedBy: string[]; // List of user UIDs who upvoted
  createdAt: string;
}
