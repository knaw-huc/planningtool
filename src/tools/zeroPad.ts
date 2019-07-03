
export function zeroPad(n: number): string {
  if (n<10) { return "0" + n} else {return "" + n}
}
