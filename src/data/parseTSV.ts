import { explicitError } from "../tools/explicitError";

type ParserResult<T> = { [K in keyof T]: FuncResult<T[K]> };
type FuncResult<T> = T extends (...args: any[]) => infer Result
  ? Result
  : never;

export function parseTSV(str: string): Array<{ [key: string]: undefined | string }>;
export function parseTSV<TParser extends { [key: string]: ( v: string | undefined, line: { [key: string]: string | undefined } ) => string | number | Date | undefined | boolean | object; } >(parser: TParser, str: string): Array<ParserResult<TParser>>;
export function parseTSV(first: string | { [key: string]: ( v: string | undefined, line: { [key: string]: string | undefined } ) => string | number | Date | undefined | boolean | object; }, second?: string ): any {
  const str = (typeof first === "string" ? first : second!) + "\n";//make sure it ends with a line-end so that we have no edge case (empty lines are ignored anyway)
  const mapper = typeof first === "string" ? undefined : first;
  const lines: string[][] = [];
  let curLine: string[] = []
  let curField = ""
  let isQuoted = false
  // debugger;
  for (let i = 0; i < str.length; i++) {
    const curChar = str[i]
    const nextChar = str[i+1]
    if (curField === '' && curChar === '"') {
      isQuoted = true
    } else {
      if (isQuoted) {
        if (curChar === '"') {
          if (nextChar === '"') {
            curField += '"'
            i++
          } else if (nextChar === "\t" || nextChar === "\n") {
            curLine.push(curField)
            curField = ""
            isQuoted = false
          } else {
            explicitError(`Could not parse '${curLine}', error at char '${i}' (${curChar}, '${nextChar}')`)
          }
        } else {
          curField += curChar
        }
      } else {
        if (curChar === "\t" || curChar === "\n") {
          curLine.push(curField)
          curField = ""
          if (curChar === "\n") {
            if (curLine.some( field => field !== "")) {
              lines.push(curLine)
            }
            curLine = []
          }
        } else {
          curField += curChar
        }
      }
    }
  }
  const result: Array<any> = [];
  const headers = lines[0].map(f => f.trim());
  const headerLookup = headers.reduce<{ [key: string]: number }>((p, c, i) => {
    p[c] = i;
    return p;
  }, {});
  for (const line of lines.slice(1)) {
    const mappedLine: { [key: string]: string } = line.reduce<any>(
      (o, f, i) => {
        o[headers[i]] = f === "" ? undefined : f;
        return o;
      },
      {}
    );
    if (mapper !== undefined) {
      const lineObj: any = {};
      for (const key in mapper) {
        const field = line[headerLookup[key]];
        const mapResult = mapper[key](field, mappedLine);
        if (mapResult !== undefined) {
          lineObj[key] = mapResult;
        }
      }
      result.push(lineObj);
    } else {
      result.push(mappedLine);
    }
  }
  return result;
}
