import {Data, Summaries} from '../model/datamodel'


export const defaultSummaries: Summaries = {
  projectsWithHoursDirectlyAssigned: {},
  teamAssignments: {},
  availableTeams: [],
  groupedProjects: {},
  perDeliverable: {},
  perEpic: {},
  perProject: {},
  perSprint: {}
}
export const defaultViewData: Data["viewData"] = {
  isConnected: false,
  endSprint: "",
  startSprint: "",
  expansions: {
    projects: {},
    sprints: {}
  },
  includedTeams: {},
}
export const minimalData: Data = {
  budgetAssignments: {},
  calendar: {},
  deliverables: {},
  epics: {},
  projects: {},
  solverResult: {
    solvedValues: {}
  },
  trackedTime: {},
  sprintPlanning: {},
  summaries: defaultSummaries,
  timetellImport: [],
  viewData: defaultViewData,
}
