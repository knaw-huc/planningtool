export function loopOver<T>(obj: {[key: string]: T | undefined} | undefined, cb: (value: T, index: string) => void): void {
  if (obj === undefined) {
    return
  }
  for (const key in obj) {
    const value = obj[key]
    if (value != undefined) {
      cb(value, key)
    }
  }
}

export function ifPresentOrIgnore<T, U>(value: T | undefined, isPresent: (value: T) => U): U | undefined {
  return ifPresent(value, isPresent)
}
export function ifPresentOrElse<T, U, V>(value: T | undefined, isPresent: (value: T) => U, isNotPresent: () => V): U | V {
  return ifPresent(value, isPresent, isNotPresent)!;
}

function ifPresent<T, U, V>(value: T | undefined, isPresent: (value: T) => U, isNotPresent?: () => V): U | V | undefined {
  if (value !== undefined) {
    return isPresent(value)
  } else if (isNotPresent) {
    return isNotPresent()
  } else {
    return undefined
  }
}

export function coalesce<TCur>(...items: Array<TCur | undefined>) {
  for (const result of items) {
    if (result !== undefined) {
      return result
    }
  }
  return undefined
}
