import { Data, WeekPlanning } from "../model/datamodel";
import { loadProjects } from "./loadProjects";
import { timetellImport } from "./timetellImport";

const commonWorkWeeks = {
  list: (
    team: string,
    monday: number,
    tuesday: number,
    wednesday: number,
    thursday: number,
    friday: number
  ): WeekPlanning =>
    [
      { [team]: monday },
      { [team]: tuesday },
      { [team]: wednesday },
      { [team]: thursday },
      { [team]: friday }
    ],
  everyday: (team: string, hours: number): WeekPlanning =>
    [
      { [team]: hours },
      { [team]: hours },
      { [team]: hours },
      { [team]: hours },
      { [team]: hours }
    ],
  "4x9": (
    team: string,
    offday: "monday" | "tuesday" | "wednesday" | "thursday" | "friday"
  ): WeekPlanning =>
    [
      { [team]: offday == "monday" ? 0 : 9 },
      { [team]: offday == "tuesday" ? 0 : 9 },
      { [team]: offday == "wednesday" ? 0 : 9 },
      { [team]: offday == "thursday" ? 0 : 9 },
      { [team]: offday == "friday" ? 0 : 9 }
    ],
  "40Hours": (team: string): WeekPlanning =>
    [
      { [team]: 8 },
      { [team]: 8 },
      { [team]: 8 },
      { [team]: 8 },
      { [team]: 8 }
    ]
};

export let data: Data = {
  timetellImport: [],
  viewData: {
    isConnected: false,
    startSprint: "2019: Sprint 01",
    endSprint: "2019: Sprint 09",
    includedTeams: { CI: true, IMG: true },
    expansions: {
      projects: {},
      sprints: {},
    }
  },
  summaries: {
    projectsWithHoursDirectlyAssigned: {},
    teamAssignments: {},
    groupedProjects: {},
    availableTeams: [],
    perEpic: {},
    perProject: {},
    perSprint: {},
    perDeliverable: {},
  },
  solverResult: {
    solvedValues: {}
  },
  trackedTime: {  },
  sprintPlanning: {},
  calendar: {},
  ...loadProjects(),
  epics: { },
  budgetAssignments: { }
};

const ttImport = timetellImport(data.projects);
data.timetellImport = ttImport.timetellImport
for (const projId in ttImport.projects) {
  data.projects[projId] = ttImport.projects[projId]
}
