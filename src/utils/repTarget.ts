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

/**
 * Bir setin geçerli hedeflerini döndürür.
 *
 * Model iki seviyede hedef tutar: hareket seviyesi (tüm setler için geçerli)
 * ve set seviyesi. Hareket seviyesinde bir değer varsa o kazanır — program
 * düzenleyici de zaten ilgili set alanını kilitleyip bunu gösterir.
 *
 * Bu öncelik eskiden her ekranda ayrı ayrı yazılıyordu ve tutarsızdı:
 * düzenleyici hareket seviyesindeki ağırlığı/RIR'ı gösterirken aktif antrenman
 * ekranı set seviyesindeki eski değerleri gösteriyordu. Tek kaynak burası.
 */
export const resolveSetTarget = (
  ex: Pick<WorkoutExercise, 'minReps' | 'maxReps' | 'weight' | 'rir'>,
  set: Pick<WorkoutSet, 'reps' | 'weight' | 'rir'>
): { weight: number; reps: string; repsValue: number; rir: number | undefined } => {
  // Kaydedilecek varsayılan tekrar, hedef aralığın dışına düşmemeli: aralık
  // 5-8 iken setin taşıdığı 10 değerini göstermek çelişkili oluyordu.
  let repsValue = set.reps;
  if (ex.minReps !== undefined && repsValue < ex.minReps) repsValue = ex.minReps;
  if (ex.maxReps !== undefined && repsValue > ex.maxReps) repsValue = ex.maxReps;

  return {
    weight: ex.weight ?? set.weight,
    reps: formatRepTarget(ex, set),
    repsValue,
    rir: ex.rir ?? set.rir,
  };
};
