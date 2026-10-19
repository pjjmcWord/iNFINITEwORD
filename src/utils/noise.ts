// Simple hash-based noise for procedural world generation
export function hash(x: number, y: number, seed: number = 42): number {
  let h = seed;
  h = ((h << 5) - h + x) | 0;
  h = ((h << 5) - h + y) | 0;
  h = (h ^ (h >>> 16)) | 0;
  h = (h * 0x45d9f3b) | 0;
  h = (h ^ (h >>> 16)) | 0;
  h = (h * 0x45d9f3b) | 0;
  h = (h ^ (h >>> 16)) | 0;
  return (h & 0x7fffffff) / 0x7fffffff;
}

export function smoothNoise(x: number, y: number, seed: number = 42): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  // Smooth interpolation
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const n00 = hash(ix, iy, seed);
  const n10 = hash(ix + 1, iy, seed);
  const n01 = hash(ix, iy + 1, seed);
  const n11 = hash(ix + 1, iy + 1, seed);

  const nx0 = n00 * (1 - sx) + n10 * sx;
  const nx1 = n01 * (1 - sx) + n11 * sx;

  return nx0 * (1 - sy) + nx1 * sy;
}

export function fbm(x: number, y: number, octaves: number = 4, seed: number = 42): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += smoothNoise(x * frequency, y * frequency, seed + i * 100) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}
