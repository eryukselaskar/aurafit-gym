import type { WorkoutExercise, PersonalRecord } from '../types';

/**
 * Epley formülü ile tahmini 1RM (tek tekrar maksimum), 0.1 kg'a yuvarlanmış.
 * Tek tekrarda formül uygulanmaz; ağırlığın kendisi zaten 1RM'dir.
 */
export const estimateOneRepMax = (weight: number, reps: number): number => {
  const raw = reps === 1 ? weight : weight * (1 + reps / 30);
  return Math.round(raw * 10) / 10;
};

/**
 * Bir seansta kırılan kişisel rekorları döndürür.
 *
 * Egzersiz başına en iyi set, önce ağırlığa sonra tekrara göre seçilir. Bu set
 * mevcut rekordan ağırdır (veya eşit ağırlıkta daha çok tekrarlıdır) ise yeni
 * rekor sayılır. Tamamlanmamış setler dikkate alınmaz.
 */
export const calculatePersonalRecords = (
  exercises: WorkoutExercise[],
  existingRecords: PersonalRecord[],
  date: string
): PersonalRecord[] => {
  const broken: PersonalRecord[] = [];

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

    const existing = existingRecords.find(pr => pr.exerciseId === ex.exerciseId);
    const isNewRecord =
      !existing ||
      bestWeight > existing.maxWeight ||
      (bestWeight === existing.maxWeight && bestReps > existing.maxReps);

    if (isNewRecord) {
      broken.push({
        exerciseId: ex.exerciseId,
        exerciseName: ex.name,
        maxWeight: bestWeight,
        maxReps: bestReps,
        oneRepMax: estimateOneRepMax(bestWeight, bestReps),
        date
      });
    }
  });

  return broken;
};
