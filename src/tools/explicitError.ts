export function explicitError(message: string, ...args: any[]): never {
  console.log(message, ...args);
  alert(message);
  throw new Error(message);
}
