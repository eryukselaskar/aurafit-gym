import { describe, it, expect } from 'vitest';
import { formatRepTarget, validateRepRange } from './repTarget';

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
