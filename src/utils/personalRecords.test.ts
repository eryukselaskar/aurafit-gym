import { describe, it, expect } from 'vitest';
import { estimateOneRepMax, calculatePersonalRecords } from './personalRecords';
import type { WorkoutExercise, PersonalRecord } from '../types';

const DATE = '2026-01-15';

const makeExercise = (
  sets: Array<{ weight: number; reps: number; completed: boolean; actualWeight?: number; actualReps?: number }>
): WorkoutExercise => ({
  id: 'we-1',
  exerciseId: 'ex-2',
  name: 'Barbell Bench Press',
  category: 'Göğüs',
  restTime: 90,
  sets: sets.map((s, i) => ({ id: `s-${i}`, ...s }))
});

describe('estimateOneRepMax', () => {
  it('tek tekrarda ağırlığın kendisini döner', () => {
    expect(estimateOneRepMax(100, 1)).toBe(100);
  });

  it('Epley formülünü uygular ve 0.1 kg hassasiyetine yuvarlar', () => {
    // 100 * (1 + 10/30) = 133.333... -> 133.3
    expect(estimateOneRepMax(100, 10)).toBe(133.3);
    // 60 * (1 + 8/30) = 76.0
    expect(estimateOneRepMax(60, 8)).toBe(76);
  });

  it('sıfır ağırlıkta sıfır döner (vücut ağırlığı hareketleri)', () => {
    expect(estimateOneRepMax(0, 12)).toBe(0);
  });
});

describe('calculatePersonalRecords', () => {
  it('rekor yoksa tamamlanan en iyi seti yeni rekor sayar', () => {
    const ex = makeExercise([
      { weight: 60, reps: 10, completed: true },
      { weight: 80, reps: 5, completed: true }
    ]);
    const prs = calculatePersonalRecords([ex], [], DATE);

    expect(prs).toHaveLength(1);
    expect(prs[0]).toMatchObject({
      exerciseId: 'ex-2',
      maxWeight: 80,
      maxReps: 5,
      date: DATE
    });
  });

  it('tamamlanmamış setleri yok sayar', () => {
    const ex = makeExercise([
      { weight: 60, reps: 10, completed: true },
      { weight: 200, reps: 1, completed: false }
    ]);
    const prs = calculatePersonalRecords([ex], [], DATE);

    expect(prs[0].maxWeight).toBe(60);
  });

  it('hedef değil gerçekleşen ağırlık/tekrarı kullanır', () => {
    const ex = makeExercise([
      { weight: 60, reps: 10, completed: true, actualWeight: 70, actualReps: 8 }
    ]);
    const prs = calculatePersonalRecords([ex], [], DATE);

    expect(prs[0]).toMatchObject({ maxWeight: 70, maxReps: 8 });
  });

  it('mevcut rekorun altında kalırsa rekor üretmez', () => {
    const existing: PersonalRecord[] = [
      { exerciseId: 'ex-2', exerciseName: 'Barbell Bench Press', maxWeight: 100, maxReps: 3, oneRepMax: 110, date: '2025-12-01' }
    ];
    const ex = makeExercise([{ weight: 90, reps: 5, completed: true }]);

    expect(calculatePersonalRecords([ex], existing, DATE)).toHaveLength(0);
  });

  it('aynı ağırlıkta daha çok tekrar yapılırsa rekor sayar', () => {
    const existing: PersonalRecord[] = [
      { exerciseId: 'ex-2', exerciseName: 'Barbell Bench Press', maxWeight: 100, maxReps: 3, oneRepMax: 110, date: '2025-12-01' }
    ];
    const ex = makeExercise([{ weight: 100, reps: 4, completed: true }]);
    const prs = calculatePersonalRecords([ex], existing, DATE);

    expect(prs).toHaveLength(1);
    expect(prs[0].maxReps).toBe(4);
  });

  it('aynı ağırlık ve aynı tekrar rekor sayılmaz', () => {
    const existing: PersonalRecord[] = [
      { exerciseId: 'ex-2', exerciseName: 'Barbell Bench Press', maxWeight: 100, maxReps: 3, oneRepMax: 110, date: '2025-12-01' }
    ];
    const ex = makeExercise([{ weight: 100, reps: 3, completed: true }]);

    expect(calculatePersonalRecords([ex], existing, DATE)).toHaveLength(0);
  });

  it('hiç set tamamlanmamış egzersizi atlar', () => {
    const ex = makeExercise([{ weight: 60, reps: 10, completed: false }]);
    expect(calculatePersonalRecords([ex], [], DATE)).toHaveLength(0);
  });
});
