
export function randomChars(count: number) {
  return Math.random().toString(36).slice(-8).substr(0, count);
}
