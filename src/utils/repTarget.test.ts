import { describe, it, expect } from 'vitest';
import { formatRepTarget, validateRepRange, resolveSetTarget } from './repTarget';

describe('formatRepTarget', () => {
  it('min ve max birlikte verilince aralık gösterir', () => {
    expect(formatRepTarget({ minReps: 6, maxReps: 12 }, { reps: 10 })).toBe('6-12');
  });

  it('yalnız min verilince "+" eki kullanır', () => {
    expect(formatRepTarget({ minReps: 8, maxReps: undefined }, { reps: 10 })).toBe('8+');
  });

  it('yalnız max verilince "≤" eki kullanır', () => {
    expect(formatRepTarget({ minReps: undefined, maxReps: 12 }, { reps: 10 })).toBe('≤12');
  });

  it('hedef yoksa setin kendi tekrarına düşer', () => {
    expect(formatRepTarget({ minReps: undefined, maxReps: undefined }, { reps: 10 })).toBe('10');
  });

  it('sıfır değerini eksik hedef sanmaz', () => {
    expect(formatRepTarget({ minReps: 0, maxReps: undefined }, { reps: 10 })).toBe('0+');
  });
});

describe('validateRepRange', () => {
  it('min > max olduğunda hata metni döner', () => {
    const err = validateRepRange({ name: 'Squat', minReps: 12, maxReps: 6 });
    expect(err).toContain('Squat');
    expect(err).toContain('12');
    expect(err).toContain('6');
  });

  it('geçerli aralıkta null döner', () => {
    expect(validateRepRange({ name: 'Squat', minReps: 6, maxReps: 12 })).toBeNull();
  });

  it('min === max geçerlidir', () => {
    expect(validateRepRange({ name: 'Squat', minReps: 8, maxReps: 8 })).toBeNull();
  });

  it('yalnız biri verilmişse doğrulama yapmaz', () => {
    expect(validateRepRange({ name: 'Squat', minReps: 12, maxReps: undefined })).toBeNull();
    expect(validateRepRange({ name: 'Squat', minReps: undefined, maxReps: 6 })).toBeNull();
  });
});

describe('resolveSetTarget', () => {
  const set = { reps: 10, weight: 20, rir: 2 };

  it('hareket seviyesi boşsa set değerlerini kullanır', () => {
    const t = resolveSetTarget({ minReps: undefined, maxReps: undefined, weight: undefined, rir: undefined }, set);
    expect(t).toEqual({ weight: 20, reps: '10', repsValue: 10, rir: 2 });
  });

  it('hareket seviyesindeki ağırlık set ağırlığını geçersiz kılar', () => {
    const t = resolveSetTarget({ minReps: undefined, maxReps: undefined, weight: 80, rir: undefined }, set);
    expect(t.weight).toBe(80);
  });

  it('hareket seviyesindeki RIR set RIR\'ını geçersiz kılar', () => {
    const t = resolveSetTarget({ minReps: undefined, maxReps: undefined, weight: undefined, rir: 0 }, set);
    expect(t.rir).toBe(0);
  });

  it('min/max aralığı set tekrarını geçersiz kılar', () => {
    const t = resolveSetTarget({ minReps: 5, maxReps: 8, weight: undefined, rir: undefined }, set);
    expect(t.reps).toBe('5-8');
  });

  it('hareket seviyesindeki 0 değerleri yok sayılmaz', () => {
    const t = resolveSetTarget({ minReps: undefined, maxReps: undefined, weight: 0, rir: 0 }, set);
    expect(t.weight).toBe(0);
    expect(t.rir).toBe(0);
  });
});

describe('resolveSetTarget repsValue', () => {
  it('hedef aralığın üstündeki set tekrarını üst sınıra çeker', () => {
    expect(resolveSetTarget({ minReps: 5, maxReps: 8, weight: undefined, rir: undefined },
      { reps: 10, weight: 20, rir: 2 }).repsValue).toBe(8);
  });

  it('hedef aralığın altındaki set tekrarını alt sınıra çeker', () => {
    expect(resolveSetTarget({ minReps: 5, maxReps: 8, weight: undefined, rir: undefined },
      { reps: 3, weight: 20, rir: 2 }).repsValue).toBe(5);
  });

  it('aralık içindeki değere dokunmaz', () => {
    expect(resolveSetTarget({ minReps: 5, maxReps: 8, weight: undefined, rir: undefined },
      { reps: 6, weight: 20, rir: 2 }).repsValue).toBe(6);
  });

  it('aralık yoksa set tekrarını aynen döndürür', () => {
    expect(resolveSetTarget({ minReps: undefined, maxReps: undefined, weight: undefined, rir: undefined },
      { reps: 10, weight: 20, rir: 2 }).repsValue).toBe(10);
  });
});
