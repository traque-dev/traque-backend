export function dedent(str: string): string {
  return str
    .split('\n')
    .map((line) => line.trimStart())
    .join('\n')
    .trim();
}
