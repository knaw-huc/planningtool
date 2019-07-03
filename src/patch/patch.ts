import { ic } from "../tools/icecream";

const replaceSym = "__replace__" as const;
const removeSym = "__remove__" as const;
type removeSymType = typeof removeSym;
export function set<T>(val: removeSymType | T): Replacer<T> {
  return {
    [replaceSym]: val,
  };
}
export function remove<T>(): Replacer<T> {
  return {
    [replaceSym]: removeSym
  };
}

export interface Replacer<T> {
  [replaceSym]: T | removeSymType;
}

type JustStructOrReplace<T> = (T extends object ? T extends Array<infer U> ? JustPatch<{[id: number]: U}> : JustPatch<T> : T) | Replacer<T>;
type MaybeStructOrReplace<T> = (T extends object ? T extends Array<infer U> ? MaybePatch<{[id: number]: U}> : MaybePatch<T> : T) | Replacer<T>;

export type Patch<T extends object> = JustPatch<T>

type JustOrMaybePatch<T> = undefined extends T ? MaybeStructOrReplace<T> : JustStructOrReplace<T>

type JustPatch<T extends object> = {
  [K in keyof T]?: JustOrMaybePatch<T[K]>
}

type MaybePatch<T extends object> = {
  [K in keyof T]: MaybeStructOrReplace<T[K]>
}

type StructOrReplace<T> = (T extends object ? Patch<T> : T) | Replacer<T>;
// export type Patch<T extends object> = { [K in keyof T]: StructOrReplace<T[K]> };

export function mergePatch<T extends object>(origPatch: T, newPatch: Patch<T>) {
  for (const key in newPatch) {
    const patchVal = newPatch[key];
    const dataVal = origPatch[key];
    if (dataVal === undefined || dataVal === null) {
      (origPatch[key] as any) = patchVal;
    } else if (patchVal != null && typeof patchVal === "object" && replaceSym in patchVal) {
      (origPatch[key] as any) = patchVal;
    } else if ((isObjLiteral(dataVal) || Array.isArray(dataVal)) && isObjLiteral(patchVal)) {
      mergePatch(dataVal as any, patchVal as any);
    } else {
      //dataVal is already provided
    }
  }
}

export function prune<T extends object>(patch: Patch<T>): Patch<Partial<T>> | undefined {
  const result: any = {}
  let hasKey = false
  for (const key in patch) {
    const value = patch[key]
    if (isObjLiteral(value)) {
      if ((value as object).hasOwnProperty(replaceSym)) {
        result[key] = value
        hasKey = true
      } else {
        const subResult = prune(value as object)
        if (subResult !== undefined) {
          hasKey = true
          result[key] = subResult
        }  
      }
    }
  }
  if (hasKey) {
    return result;
  } else {
    return undefined;
  }
}

export function applyPatch<T extends object>(data: T, patch: Patch<T>) {
  for (const key in patch) {
    const patchVal = patch[key];
    const dataVal = data[key];
    if (dataVal === undefined || dataVal === null) {
      const unwrappedVal = removeReplaceSyms(patchVal);
      if (unwrappedVal === removeSym) {
        delete data[key]
      } else {
        data[key] = unwrappedVal
      }
    } else if (patchVal != null && typeof patchVal === "object" && replaceSym in patchVal) {
      const replaceVal = (patchVal as any)[replaceSym];
      if (replaceVal === removeSym) {
        delete data[key];
      } else {
        data[key] = replaceVal
      }
    } else if ((isObjLiteral(dataVal) && isObjLiteral(patchVal)) || (Array.isArray(dataVal) && Array.isArray(patchVal))) {
      applyPatch(dataVal as any, patchVal as any);
    } else {
      //dataVal is already provided
    }
  }
}

function removeReplaceSyms(patch: any): any {
  if (isObjLiteral(patch)) {
    if (patch.hasOwnProperty(replaceSym)) {
      return patch[replaceSym];
    } else {
      const result: any = {};
      for (const key in patch) {
        const unwrapped = removeReplaceSyms(patch[key]);
        if (unwrapped !== removeSym) {
          result[key] = unwrapped
        }
      }
      return result;
    }
  } else {
    return patch;
  }
}

function isObjLiteral(_obj: unknown) {
  if (_obj === null || typeof _obj !== "object") {
    return false;
  } else {
    return Object.getPrototypeOf(_obj) === Object.getPrototypeOf({});
  }
}
