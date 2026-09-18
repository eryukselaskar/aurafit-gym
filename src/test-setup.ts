// Testler için bellek-içi localStorage.
//
// Uygulama kodu tarayıcı API'sini doğrudan kullandığı için node ortamında bir
// karşılık gerekiyor. jsdom da işi görürdü ama yalnızca bunun için ~28 saniye
// ekliyordu; depolama davranışı bu kadarıyla birebir aynı.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

globalThis.localStorage = new MemoryStorage();
