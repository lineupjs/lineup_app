
export function randomChars(count: number) {
  return Math.random().toString(36).slice(-8).substr(0, count);
}

export function cleanName(name: string) {
  return `${name.toLowerCase().replace(/[\s@;./\\:_+~"#'!$§%&()[\]{}?`´]+/g, '-')}-${randomChars(3)}`;
}
