import { describe, it, expect, beforeEach } from 'vitest';
import {
  getExercises,
  saveExercises,
  getCatalog,
  loadFullCatalog,
  dedupeByName
} from './localStorage';
import type { Exercise } from '../types';

const KEY = 'aurafit_exercises';

const custom = (id: string, name: string): Exercise => ({
  id,
  name,
  category: 'Göğüs',
  isCustom: true
});

beforeEach(() => {
  localStorage.clear();
});

describe('dedupeByName', () => {
  it('aynı ismi ilk listeden alır', () => {
    const a: Exercise[] = [{ id: 'a1', name: 'Bench Press', category: 'Göğüs', description: 'iyi' }];
    const b: Exercise[] = [{ id: 'b1', name: 'bench press', category: 'Göğüs', description: 'kötü' }];

    const result = dedupeByName([a, b]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a1');
  });

  it('büyük/küçük harf ve baştaki boşluğu yok sayar', () => {
    const a: Exercise[] = [{ id: 'a1', name: '  Squat ', category: 'Bacak' }];
    const b: Exercise[] = [{ id: 'b1', name: 'SQUAT', category: 'Bacak' }];

    expect(dedupeByName([a, b])).toHaveLength(1);
  });
});

describe('getExercises / saveExercises', () => {
  it('kayıt yokken dahili katalogu döner', () => {
    const result = getExercises();
    expect(result).toEqual(getCatalog());
    // Okuma işlemi katalogu diske yazmamalı.
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('localStorage\'a yalnızca özel egzersizleri yazar', () => {
    const mine = custom('ex-custom-1', 'Benim Hareketim');
    saveExercises([...getCatalog(), mine]);

    const stored = JSON.parse(localStorage.getItem(KEY)!);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('ex-custom-1');
  });

  it('özel egzersizleri katalogun önüne ekleyerek geri okur', () => {
    const mine = custom('ex-custom-1', 'Benim Hareketim');
    saveExercises([mine]);

    const result = getExercises();
    expect(result[0].id).toBe('ex-custom-1');
    expect(result).toHaveLength(getCatalog().length + 1);
  });

  it('eski formatta kaydedilmiş tüm katalogu ilk okumada temizler', () => {
    // Eski sürüm davranışı: katalogun tamamı + bir özel hareket yazılmıştı.
    const legacy = [...getCatalog(), custom('ex-custom-1', 'Benim Hareketim')];
    localStorage.setItem(KEY, JSON.stringify(legacy));

    const result = getExercises();

    const stored = JSON.parse(localStorage.getItem(KEY)!);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('ex-custom-1');
    // Kullanıcının gördüğü liste değişmemeli.
    expect(result).toHaveLength(getCatalog().length + 1);
  });

  it('bozuk JSON\'da çökmez, katalogu döner', () => {
    localStorage.setItem(KEY, '{bozuk');
    expect(getExercises()).toEqual(getCatalog());
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});

describe('loadFullCatalog', () => {
  it('veri setini yükleyip katalogu genişletir ve tekrar isim bırakmaz', async () => {
    const before = getCatalog().length;
    const full = await loadFullCatalog();

    expect(full.length).toBeGreaterThan(before);
    expect(getCatalog()).toBe(full);

    const names = full.map(ex => ex.name.trim().toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it('veri setini yalnızca bir kez indirir', async () => {
    const first = await loadFullCatalog();
    const second = await loadFullCatalog();
    expect(second).toBe(first);
  });
});
