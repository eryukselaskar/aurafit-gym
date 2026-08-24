import type { WorkoutExercise, WorkoutSet } from '../types';

/**
 * Egzersizin hedef tekrar metnini üretir.
 * Önceden yalnızca min VE max birlikte doluysa aralık gösteriliyordu; tek başına
 * girilen Min/Max sessizce yok sayılıyordu (kaydediliyor ama hiçbir yerde görünmüyordu).
 *
 *   min + max -> "6-12"
 *   yalnız min -> "6+"
 *   yalnız max -> "≤12"
 *   hiçbiri    -> set bazlı değer
 */
export const formatRepTarget = (
  ex: Pick<WorkoutExercise, 'minReps' | 'maxReps'>,
  set: Pick<WorkoutSet, 'reps'>
): string => {
  const { minReps, maxReps } = ex;
  if (minReps !== undefined && maxReps !== undefined) return `${minReps}-${maxReps}`;
  if (minReps !== undefined) return `${minReps}+`;
  if (maxReps !== undefined) return `≤${maxReps}`;
  return `${set.reps}`;
};

/** Min/Max hedefi tutarsızsa hata metni döner (min > max gibi), sorun yoksa null. */
export const validateRepRange = (
  ex: Pick<WorkoutExercise, 'minReps' | 'maxReps' | 'name'>
): string | null => {
  const { minReps, maxReps } = ex;
  if (minReps !== undefined && maxReps !== undefined && minReps > maxReps) {
    return `"${ex.name}" için minimum tekrar (${minReps}) maksimumdan (${maxReps}) büyük olamaz.`;
  }
  return null;
};
