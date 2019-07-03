export function countItems(obj: {
  [key: string]: any;
} | any[] | undefined | null) {
  if (obj === null || obj === undefined) {
    return 0;
  }
  else if (Array.isArray(obj)) {
    return obj.length;
  }
  else {
    return Object.keys(obj).length;
  }
}
