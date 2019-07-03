type SimpleWalker<T> = UnionToIntersection<Inner<T>>
type Inner<T> = 
  T extends object 
    ? T extends Array<infer U>
      ? { 
        push(newValue: U): T, 
        set(pos: number, newValue: U): T, 
        replace(newValue: T): T, 
        unshift(newValue: U): T, 
        makeSureExists(newValue: U): T, 
        change(pos: number, defaultValue: U, newValue: (input: U) => U): T, 
      }
      : {} extends T
        ? { <K extends keyof T>(key: K): SimpleWalker<T[K]> } & Updaters<T>
        : { <K extends keyof T>(key: K, defaultValue: Without<T, K>): SimpleWalker<T[K]> } & Updaters<T>
    : T extends undefined | null 
      ? never
      : Updaters<T>
interface Updaters<T> {
  update(defaultValue: T, mapper: (input: T) => T | undefined): T 
  update(defaultValue: undefined, mapper: (input: T | undefined) => T | undefined): T | undefined
  assign(newValue: T): T
  assignOrDelete(newValue: T | undefined): T 
}
type Without<T, K> = Pick<T, Exclude<keyof T, K>>;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

export function sett<T extends object>(obj: T): SimpleWalker<T> {
  return settImpl(obj, []) as unknown as SimpleWalker<T>
}

function walkPathUntilParent(root: any, path: Array<[string | number | symbol, any] | [string]>) {
  let cur: any = root
  for (let i = 0; i < path.length - 1; i++) {
    const defaultValue = path[i+1] && path[i+1].length > 1 ? path[i+1][1] : {}
    const key = path[i][0]
    if (cur[key] == null || typeof cur[key] !== "object") {
      cur[key] = defaultValue
    }
    cur = cur[key]
  }
  return [cur, path[path.length - 1][0]]
}

function settImpl(root: any, path: Array<[string, any] | [string]>) {
  function step(key: string, defaultValue: any) {
    if (arguments.length > 1) {
      return settImpl(root, path.concat([[key, defaultValue]]))
    } else {
      return settImpl(root, path.concat([[key]]))
    }
  }
  step.update = function (defaultValue: any, mapper: (input: any) => any) {
    const [container, key] = walkPathUntilParent(root, path)
    const input = key in container ? container[key] : defaultValue
    const result = mapper(input);
    if (result === undefined) {
      delete container[key]
    } else {
      container[key] = result
    }
    return container[key]
  }
  step.assign = function (newValue: any) {
    const [container, key] = walkPathUntilParent(root, path)
    container[key] = newValue
    return container[key]
  }
  step.assignOrDelete = function (newValue: any | undefined) {
    const [container, key] = walkPathUntilParent(root, path)
    if (newValue === undefined) {
      delete container[key]
    } else {
      container[key] = newValue
    }
  }
  step.push = function(newValue: any): any {
    const [container, key] = walkPathUntilParent(root, path)
    if (!container[key]) {
      container[key] = []
    }
    container[key].push(newValue)
  }
  step.set = function(pos: number, newValue: any): any {
    const [container, key] = walkPathUntilParent(root, path)
    if (!container[key]) {
      container[key] = []
    }
    container[key][pos] = newValue
  }
  step.replace = function(newValue: any): any {
    const [container, key] = walkPathUntilParent(root, path)
    container[key] = newValue
  }
  step.unshift = function(newValue: any): any {
    const [container, key] = walkPathUntilParent(root, path)
    if (!container[key]) {
      container[key] = []
    }
    container[key].unshift(newValue)
  }
  step.makeSureExists = function (newValue: any): any {
    const [container, key] = walkPathUntilParent(root, path)
    if (!container[key]) {
      container[key] = []
    }
    if (container[key].indexOf(newValue) === -1) {
      container[key].push(newValue)
    }
  }
  step.change = function (pos: number, defaultValue: any, newValue: (input: any) => any): any {
    const [container, key] = walkPathUntilParent(root, path)
    if (!container[key]) {
      container[key] = []
    }
    if (container[key].hasOwnProperty(pos)) {
      container[key][pos] = newValue(container[key][pos])
    } else {
      container[key][pos] = newValue(defaultValue)
    }
  }

  return step
}

const retrieve = Symbol("retrieve")

function innerSafeget(root: any){
  if (root != null && typeof root === "object") {
    const proxySpec: ProxyHandler<any> = {
      get(target, prop, receiver) {
        if (prop === retrieve) {
          return root
        } else {
          return innerSafeget(root[prop])
        } 
      }
    }
    return new Proxy(root, proxySpec)
  } else {
    const proxySpec: ProxyHandler<any> = {
      get(target, prop, receiver) {
        if (prop === retrieve) {
          return root
        } else {
          return innerSafeget(root == null ? root : undefined)
        }
      }
    }
    return new Proxy({}, proxySpec)
  }
}

export function makeSafeGettable<T>(input: T): Gettable<T> {
  return function<U, V>(cb: (d: Traversable<T, false, false>) => CanBeUndefined<U> | CanBeNull<U> | CannotBeUndefined<U>, mapOrDef?: (input: U) => V | V, def?: V) {
    const val = (cb(innerSafeget(input)) as any)[retrieve]
    if (val == null) {
      if (arguments.length === 2) {
        return mapOrDef
      } else {
        return def
      }
    } else {
      if (arguments.length === 3) {
        return (mapOrDef as any)(val)
      } else {
        return val
      }
    }
  }
}

const maybeUndefined = Symbol("isMaybe")
const maybeNull = Symbol("maybeNull")
const val = Symbol("val")

export interface CanBeUndefined<T> {
  [maybeUndefined]: true, 
  [val]: T
}

export interface CanBeUndefinedAndNull<T> {
  [maybeUndefined]: true, 
  [maybeNull]: true, 
  [val]: T
}

export interface CanBeNull<T> {
  [maybeNull]: true, 
  [val]: T
}

export interface CannotBeUndefined<T> {
  [val]: T
}

type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true

type Traversable<T, IsUndefined extends boolean, IsNull extends boolean> = 
  undefined extends T 
    ? null extends T 
      ? Maybe<T, true, true>
      : Maybe<T, true, IsNull>
    : null extends T 
      ? Maybe<T, IsUndefined, true>
      : Maybe<T, IsUndefined, IsNull>

type Maybe<T, IsUndefined extends boolean, IsNull extends boolean> = T extends object
  ? { [K in keyof T]-?: Traversable<T[K], IsUndefined, IsNull> }
    & (
      IsUndefined extends true 
        ? IsNull extends true 
          ? CanBeUndefinedAndNull<T> 
          : CanBeUndefined<T> 
        : IsNull extends true 
          ? CanBeNull<T>
          : CannotBeUndefined<T>
    )
  : T extends undefined | null 
    ? never 
    : (
      IsUndefined extends true 
        ? IsNull extends true 
          ? CanBeUndefinedAndNull<T> 
          : CanBeUndefined<T> 
        : IsNull extends true 
          ? CanBeNull<T>
          : CannotBeUndefined<T>
    )

// type Maybe<T, IsUndefined extends boolean, IsNull extends boolean> = T extends object
//   ? & { [K in keyof T]-?: Traversable<T[K], IsUndefined, IsNull> }
//     & CannotBeUndefined<T>
//     & (IsUndefined extends true ? CanBeUndefined<T> : unknown)
//     & (IsNull extends true ? CanBeNull<T> : unknown)
//   : T extends undefined | null 
//     ? never 
//     : & CannotBeUndefined<T>
//       & (IsUndefined extends true ? CanBeUndefined<T> : unknown)
//       & (IsNull extends true ? CanBeNull<T> : unknown)

export interface Gettable<D> {
  <U>(cb: (input: Traversable<D, false, false>) => Traversable<U, true, true>): U | undefined | null
  <U, V, W>(cb: (input: Traversable<D, false, false>) => Traversable<U, true, true>, map: (input: U) => V, def: W): V | W
  <U, V>(cb: (input: Traversable<D, false, false>) => Traversable<U, true, true>, def: V): U | V

  <U>(cb: (input: Traversable<D, false, false>) => Traversable<U, false, true>): U | null
  <U, V, W>(cb: (input: Traversable<D, false, false>) => Traversable<U, false, true>, map: (input: U) => V, def: W): V | W
  <U, V>(cb: (input: Traversable<D, false, false>) => Traversable<U, false, true>, def: V): U | V

  <U>(cb: (input: Traversable<D, false, false>) => Traversable<U, true, false>): U | undefined
  <U, V, W>(cb: (input: Traversable<D, false, false>) => Traversable<U, true, false>, map: (input: U) => V, def: W): V | W
  <U, V>(cb: (input: Traversable<D, false, false>) => Traversable<U, true, false>, def: V): U | V

  <U>(cb: (input: Traversable<D, false, false>) => Traversable<U, false, false>): U
}

// type myUnion = {foo: "fa", val: number} | {foo: "ba", ras: string}
// declare const s: Gettable<{a: myUnion}>
// //FIXME: this should work
// const res = s(x=>x.a.val)
