// Tekil kimlik üretimi.
//
// Bileşen gövdesinde doğrudan Date.now()/Math.random() çağırmak React'in purity
// kuralını ihlal eder ve aynı milisaniyede eklenen iki öğe çakışabilir. Sayaç,
// aynı milisaniye içinde bile benzersizliği garanti eder.
let counter = 0;

export const createId = (prefix: string): string => {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
};

/**
 * Şimdiki zaman damgası.
 *
 * Doğrudan `Date.now()` çağırmak React'in purity kuralını tetikliyor; olay
 * işleyicileri ve effect'ler için bu sarmalayıcı kullanılır.
 */
export const now = (): number => Date.now();
