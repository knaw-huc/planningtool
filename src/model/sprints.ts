import { Data, SprintPlanning } from "./datamodel";
import { getMonday, getWeekYear, getWeek, getLastWeek } from "./date-calc";
import { zeroPad } from "../tools/zeroPad";
import { loopOver } from "../tools/data-access";
import { Patch, set, Replacer } from "../patch/patch";

export function createSprintsUntilYear(from: number, maxYear: number): Patch<Data> {
  const resultPlanning: Patch<Data["sprintPlanning"]> = {}
  for (let year = from; year <= maxYear; year++) {
    const planning: {[week: string]: Replacer<string>} = { };
    resultPlanning[year] = planning;
    const lastWeek = getLastWeek(year)
    let week = 1;
    let sprintNum = 1;
    while (week < lastWeek) {
      const id = makeSprintId(year, sprintNum++);
      planning[week++] = set(id)
      planning[week++] = set(id)
    }
  }
  return {
    sprintPlanning: resultPlanning
  };
}

// window.createSprintsUntilYear = createSprintsUntilYear;

export function* getSprints(sprintPlanning: SprintPlanning, fromYear: number = 2019, fromWeek: number = 1): IterableIterator<{sprintId: string, length: number, year: number, firstWeek: number, lastWeek: number, number: number}> {
  let prevSprint: string | undefined = undefined;
  let sprintLength = 0;
  let firstWeek = 1
  let lastWeek = 1
  let finalYear: number | undefined = undefined;
  let finalQuarter: number | undefined = undefined;
  const years = Object.keys(sprintPlanning).map(x => +x).filter(x => x >= fromYear).sort((a, b) => a-b)
  let sprintNumber = 1
  let windowEntered = false
  for (const year of years) {
    finalYear = year
    sprintNumber = 1
    let weeks = Object.keys(sprintPlanning[year]).map(x=>+x).sort((a, b) => a-b)
    for (const week of weeks) {
      const sprintId = sprintPlanning[year][week]
      if (prevSprint === undefined ) {
        prevSprint = sprintId
        sprintLength = 1
      } else if (prevSprint !== sprintId) {
        if (year > fromYear || week >= fromWeek) {
          if (windowEntered) {
            yield {sprintId: prevSprint!, length: sprintLength, year: +year, firstWeek, lastWeek, number: sprintNumber}
          } else {
            windowEntered = true
          }
        }
        prevSprint = sprintId
        sprintLength = 1
        firstWeek = +week
        lastWeek = +week
        sprintNumber++
      } else {
        sprintLength++
        lastWeek++
      }
    }
  }
  if (finalYear !== undefined && finalQuarter !== undefined) {
    yield {sprintId: prevSprint!, length: sprintLength, year: +finalYear, firstWeek, lastWeek, number: sprintNumber}
  }
}

export function makeSprintId(year: number, sprint: number) {
  return year + ": Sprint " + zeroPad(sprint);
}
