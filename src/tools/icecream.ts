
export function ic(): void
export function ic<T, U>(cb: () => T, map: (input: T) => U): T
export function ic<T, U>(cb: () => T): T
export function ic(value: string): void
export function ic<T, U>(cb?: string | (() => T), map?: (input: T) => U): T | undefined {
  if (cb === undefined) {
    console.log(`hit line ${new Error().stack!.split("\n")[1].split(":")[2]}`)
    return undefined
  } else if (typeof cb !== "function") {
    console.log(`hit ic(${cb}) at ${new Error().stack!.split("\n")[1].split(":")[2]}`)
    return undefined
  } else {
    const result = cb()
    const displayResult = map ? map(result) : result
    console.log(`${cb.toString().split("=>", 2)[1].trim()} = `, displayResult, ` at line ${new Error().stack!.split("\n")[1].split(":")[2]}`)
    return result;
  }
}
