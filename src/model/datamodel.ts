export interface Data {
  sprintPlanning: SprintPlanning
  calendar: Calendars;
  projects: Projects;
  deliverables: Deliverables;
  epics: Epics;
  budgetAssignments: BudgetAssignments;
  trackedTime: TrackedTime
  summaries: Summaries;
  solverResult: SolverResult;
  viewData: {
    isConnected: boolean;
    startSprint: string;
    endSprint: string;
    expansions: Expansions;
    includedTeams: {
      [teamId: string]: undefined | true;
    };
    currentTab?: string,
    showPast?: boolean
  };
  timetellImport: Array<{
    Datum: string,
    Medewerker: string,
    Project: {
      label: string,
      proj: string
    };
    Minuten: number;
    Uren_text?: string;
  }>;
}

export interface SprintPlanning {
  [year: string]: {
    [week: string]: string //sprintId
  }
}

export interface Expansions {
  projects: {
    [groupId: string]:
      | undefined
      | {
          expanded: boolean;
          perProject: {
            [projectId: string]: undefined | boolean;
          };
        };
  };
  sprints: {
    [sprintId: string]:
      | undefined
      | {
          expanded: boolean;
          perTeam: {
            [teamId: string]: undefined | boolean;
          };
        };
  };
}
export interface EpicSummary {
  totalPlanned?: number;
  perGoal: {
    [goalId: string]:
      | undefined
      | {
          totalPlanned?: number;
        };
  };
  perDeliverable: {
    [deliverableId: string]:
      | undefined
      | {
          totalPlanned: number;
          assignedTeams: { [teamId: string]: true };
        };
  };
}
export interface WorkableAndAssignedSummary {
  totalworkableHours?: number;
  totalAssignedHours?: number;
  totalRemainingHours?: number;
  perEpic: {
    [epicId: string]:
      | undefined
      | {
          totalAssigned?: number;
          perGoal: {
            [goalId: string]:
              | undefined
              | {
                  totalAssigned?: number;
                  perTeam: {
                    [teamId: string]:
                      | undefined
                      | {
                          totalAssigned?: number;
                        };
                  };
                };
          };
        };
  };
  teamTotals: {
    [teamId: string]:
      | undefined
      | {
          totalAssignedHours?: number;
          totalworkableHours?: number;
          totalRemainingHours?: number;
          perMember: {
            [memberId: string]:
              | undefined
              | {
                  totalAssignedHours?: number;
                  totalworkableHours?: number;
                  totalRemainingHours?: number;
                };
          };
        };
  };
}

export interface SolverSummary {
  total?: number;
  perEpic: {
    [epicId: string]: undefined | number;
  };
}

export interface Summaries {
  groupedProjects: {
    [groupId: string]: { projects: { [projectId: string]: undefined | Project }; deliverablesCount: number };
  };
  teamAssignments: AssignmentSummary
  availableTeams: string[];
  projectsWithHoursDirectlyAssigned: {
    [projectId: string]: {[teamId: string]: true}
  }
  perProject: {
    [projectId: string]:
      | undefined
      | {
          sumTimeTell: number;
          budgetRemaining: number;
          totalPlanned: number
        };
  };
  perDeliverable: {
    [deliverableId: string]:
      | undefined
      | {
          totalPlanned: number
          totalTracked: number
          assignedTeams: {
            [teamId: string]: true;
          };
        };
  };
  perEpic: {
    [epicId: string]: undefined | EpicSummary;
  };
  perSprint: {
    [sprintId: string]:
      | undefined
      | {
          availableTeamsAndMembers: {
            [teamId: string]: {
              [memberId: string]: true;
            };
          };
          workableAndAssigned: WorkableAndAssignedSummary;
          solved: SolverSummary;
          trackedTime: {
            [teamId: string]: undefined | {
              total?: number
              perEpic: {
                [epicId: string]: undefined | number
              },
              hoursAssignedToProjectsNotEpics: {
                [projectId: string]: undefined | number
              }  
            }
          }
        };
  };
}


export interface AssignmentSummary {
  [year: string]: {
    [week: string]: { 
      perMember: { 
        [memberId: string]: [{[teamId: string]: true}, {[teamId: string]: true}, {[teamId: string]: true}, {[teamId: string]: true}, {[teamId: string]: true}] 
      }; 
      perTeam: { 
        [teamId: string]: [{[memberId: string]: true}, {[memberId: string]: true}, {[memberId: string]: true}, {[memberId: string]: true}, {[memberId: string]: true}] 
      } 
    };
  };
}

export interface SolverResult {
  solvedValues: {
    [epicId: string]:
      | undefined
      | {
          [deliverableId: string]:
            | undefined
            | {
                [sprintId: string]:
                  | undefined
                  | {
                      [teamId: string]: undefined | number;
                    };
              };
        };
  };
}

export interface TrackedDay {
  [teamId: string]: undefined | {
    [memberId: string]: undefined | {
      [projectId: string]: undefined | {
        direct: number
        perEpic: {
          [epicId: string]: undefined | number
        }
      }
    }
  }  
}

export interface TrackedTime {
  [year: string]: undefined | {
    [week: string]: undefined | {
      0: TrackedDay
      1: TrackedDay
      2: TrackedDay
      3: TrackedDay
      4: TrackedDay
    }
  }  
}

export interface Calendars {
  [memberId: string]: undefined | Calendar;
}

export interface DayPlanning {
  [teamId: string]: undefined | number;
}

export type WeekPlanning = [DayPlanning, DayPlanning, DayPlanning, DayPlanning, DayPlanning];
export type WeekOverride = [
  DayPlanning | null,
  DayPlanning | null,
  DayPlanning | null,
  DayPlanning | null,
  DayPlanning | null
];
export interface Calendar {
  employeenr: string,
  employeefullname: string,
  templates: {
    [sprintId: string]: undefined | WeekPlanning;
  };
  exceptions: {
    [sprintId: string]: undefined | WeekOverride;
  };
}

export interface Projects {
  [projectId: string]: undefined | Project;
}
export interface Project {
  deliverables: {
    [deliverableId: string]: undefined | true;
  };
  hoursAvailable: number;
  done: boolean;
  projectLead?: string
  remarks?: string

  movedTo?: string; //projectId
  group: string;
  projectnr?: string;
  shortHand: string;
  label: string;
  availableFrom?: string;
  availableUntil?: string;
}

export interface Deliverables {
  [deliverableId: string]: undefined | Deliverable;
}
export interface Deliverable {
  label: string;
  description: string;
  availableFrom?: string;
  availableUntil?: string;
  deadline?: {
    date: string;
    reason: string;
  };
  done: boolean;
}

export interface Epics {
  [epicId: string]: undefined | EpicMetadata;
}
export interface EpicMetadata {
  order?: string
  label: string;
  done: boolean;
  goals: {
    [goalId: string]: undefined | Goal;
  };
}
export interface Goal {
  label: string;
}

export type SolverSetting = { type: "hardcoded"; hardCodedValue: number } | { type: "solveable" };

export interface BudgetAssignments {
  [epicId: string]: undefined | {
    [deliverableId: string]: undefined | {
      max?: number,
      perSprint: {
        [sprintId: string]: undefined | {
          [teamId: string]: undefined | SolverSetting;
        };
      }
    }
  }
}
