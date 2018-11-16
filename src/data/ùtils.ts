
export function randomChars(count: number) {
  return Math.random().toString(36).slice(-8).substr(0, count);
}

export function normalize(name: string) {
  return name.toLowerCase().replace(/[\s@;./\\:_+~"#'!$§%&()[\]{}?`´]+/g, '_');
}

export function cleanName(name: string) {
  return `${normalize(name)}-${randomChars(3)}`;
}
