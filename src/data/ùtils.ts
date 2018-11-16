
export function randomChars(count: number) {
  return Math.random().toString(36).slice(-8).substr(0, count);
}

export function normalize(name: string) {
  return name.toLowerCase().replace(/[\s@;./\\:_+~"#'!$§%&()[\]{}?`´]+/g, '_');
}

export function cleanName(name: string) {
  return `${normalize(name)}-${randomChars(3)}`;
}


export function fixHeaders(csv: string) {
  const line = csv.search(/[\n\r]/);
  if (line < 0) {
    return csv;
  }
  // don't include ; as common separator and no quote chars
  const headers = csv.slice(0, line).replace(/[\s@./\\:_+~#!$§%&()[\]{}?`´]+/g, '_');

  return `${headers}${csv.slice(line)}`;
}
