// Global seed for procedural world generation
// Initialize with a random seed so each page load has a different world
let currentSeed = Math.floor(Math.random() * 1000000);

export function getWorldSeed(): number {
  return currentSeed;
}

export function setWorldSeed(seed: number): void {
  currentSeed = seed;
}

export function generateNewSeed(): number {
  currentSeed = Math.floor(Math.random() * 1000000);
  return currentSeed;
}
