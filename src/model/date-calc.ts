import { zeroPad } from "../tools/zeroPad";
import { explicitError } from "../tools/explicitError";
import { SprintPlanning } from "./datamodel";


export function getWeekYear(srcDate: Date) {
  var date = new Date(srcDate.getTime());
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  return date.getFullYear();
}

export function getWeek(srcDate: Date) {
  var date = new Date(srcDate.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
}

export function getLastWeek(year: number) {
  let weekOfNewYearsEve = getWeek(new Date(year + "-12-31"))
  if (weekOfNewYearsEve === 1) {
    return 52 //A year with 31st of dec in week 1 of the next year must have 52 weeks 
  } else {
    return weekOfNewYearsEve
  }
}

export function getMonday(year: number, week: number) {
  var simple = new Date(year, 0, 1 + (week - 1) * 7);
  var dow = simple.getDay();
  var ISOweekStart = simple;
  if (dow <= 4)
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}


export function format(parsed: Date) {
  return parsed.getFullYear() + "-" + zeroPad(parsed.getMonth() + 1) + "-" + zeroPad(parsed.getDate())
}

export function formatTime(time: number) {
  if (time == undefined) {
    return undefined
  } else {
    return zeroPad(Math.floor(time / 60)) + ":" + zeroPad(time % 60)
  }
}

export function parseTime(str: string) {
  if (str === "") {
    return undefined
  } else {
    const segments = str.split(":").map(x=>+x)
    return segments[0]*60 + segments[1]
  }
}

export function getWeekCountForQuarter(year: number, quarter: number): number {
  if (quarter === 4 && getLastWeek(year) === 53) {
    return 5 + 4 + 5
  } else {
    return 4 + 4 + 5
  }
}

export function getDayOfWeek(date: Date): 0 | 1 | 2 | 3| 4 {
  let day = date.getDay() - 1 // give monday idx 0
  if (day === -1) {
    day = 6
  }
  if (day > 4) {
    console.log("Work was logged on a weekend day")
    return 0 //weekend days count as monday
  }
  return day as 0 | 1 | 2 | 3| 4
}

/** 
 * Round minutes to a decimal with quarterly precision
 */ 
export function minutesToHourFractions(input: number) {
  return Math.round(input / 15) / 4
}


export function isInPast(year: number, week: number, today: Date) {
  const thisweek = getWeek(today);
  const thisyear = getWeekYear(today);
  return year < thisyear || (year === thisyear && week < thisweek)
}

export function getFirstWeekOfSprint(year:number, week: number, sprintPlanning: SprintPlanning) {
  let sprintId = sprintPlanning[year][week]
  while (sprintPlanning[year][--week] === sprintId) {
  }
  return week + 1
}
