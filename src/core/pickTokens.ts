function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createPicker(seed?: string | number): (length: number) => number {
  if (seed === undefined) {
    return (length) => Math.floor(Math.random() * length);
  }

  let state = hashSeed(String(seed)) || 1;
  return (length) => {
    state = Math.imul(1664525, state) + 1013904223;
    return (state >>> 0) % length;
  };
}

export function pickTwo<T>(items: T[], pick: (length: number) => number): [T, T] {
  if (items.length === 0) {
    throw new Error('Stampog needs at least one token to pick from.');
  }
  return [items[pick(items.length)], items[pick(items.length)]];
}
