
export function For<T>(end: number, cb: (i: number) => T[]): T[]
export function For<T>(start: number, end: number, cb: (i: number) => T[]): T[]
export function For<T>(start: number, check: (i: number) => boolean, inc: (i: number) => number, cb: (i: number) => T[]): T[]
export function For<T>() {
  let start, check, inc, cb;
  if (typeof arguments[0] === "number" && typeof arguments[1] === "function" && arguments.length === 2) {
    start = 0
    check = (i: number) => i < arguments[0]
    inc = (i: number) => i+1
    cb = arguments[1]
  } else if (typeof arguments[0] === "number" && typeof arguments[1] === "number" && typeof arguments[2] === "function" && arguments.length === 3) {
    start = arguments[0]
    check = (i: number) => i < arguments[1]
    inc = (i: number) => i+1
    cb = arguments[2]
  } else if (typeof arguments[0] === "number" && typeof arguments[1] === "function" && typeof arguments[2] === "function"  && typeof arguments[3] === "function" && arguments.length === 4) {
    start = arguments[0]
    check = arguments[1]
    inc = arguments[2]
    cb = arguments[3]
  } else {
    throw new Error("Incorrect arguments")
  }
  const result: T[] = [];
  for (let i = start; check(i); i = inc(i)) {
    result.splice(result.length, 0, ...cb(i))
  }
  return result;
}

export function With<T, U>(value: T, cb: (input: T) => U): U {
  return cb(value)
}

export function LoopOver<T, U>(arr: undefined | Iterable<T | undefined>, cb: (value: T, index: number, full: T[]) => U[]): U[]
export function LoopOver<T, U>(arr: undefined | Array<T | undefined> | Iterable<T | undefined>, cb: (value: T, index: number, full: T[]) => U[]): U[]
export function LoopOver<T, U>(obj: undefined | {[key: string]: T | undefined}, cb: (value: T, key: string, index: number, full: {[key: string]: T}) => U[]): U[]
export function LoopOver<T, U>(arrOrObj: any, cb: (...args: any[]) => U[]): U[] {
  const s: Iterator<T> = null as any;
  const result: U[] = [];
  let i = 0;
  if (arrOrObj === undefined || arrOrObj === null) {
    return result
  }
  if (Array.isArray(arrOrObj) || arrOrObj[Symbol.iterator]) {
    for (const input of arrOrObj) {
      result.splice(result.length, 0, ...cb(input, i++, arrOrObj))
    }
  } else {
    for (const key in arrOrObj) {
      result.splice(result.length, 0, ...cb(arrOrObj[key], key, i++, arrOrObj))
    }
  }
  return result;
}

export function If<T>(test: boolean | undefined | null, whenTrue: () => T[], whenFalse?: () => T[]): T[] {
  if (test) {
    return whenTrue()
  } else {
    if (whenFalse !== undefined) {
      return whenFalse()
    } else {
      return []
    }
  }
}
