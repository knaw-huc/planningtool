import { Data, Project, Deliverable, Summaries, SolverSetting, WeekPlanning, WeekOverride, DayPlanning, TrackedDay } from "./model/datamodel";
import { ifPresentOrElse } from "./tools/data-access";
import { zeroPad } from "./tools/zeroPad";
import { Gettable, sett } from "./tools/getset";
import { set, Patch, remove, Replacer } from "./patch/patch";
import { parseTime, format } from "./model/date-calc";
import { ic } from "./tools/icecream";

type RemoveDataArg<U, T extends object> = U extends { func: (arg1: Gettable<T>, ...rest: infer Args) => Patch<T> | null; storeOnLog: boolean }
  ? (...args: Args) => (() => void)
  : never
type CallableMutators<T extends mutatorsSpec<D>, D extends object> = { [K in keyof T]: RemoveDataArg<T[K], D> };

interface mutatorsSpec<D extends object> {
  [key: string]: { func: (arg1: Gettable<D>, ...rest: any[]) => Patch<D> | null, storeOnLog: boolean}
}

export type Mutators = CallableMutators<typeof mutatorSpec, Data>;

const mutatorSpec = {
  toggleShowPast: {
    storeOnLog: false,
    func: function toggleShowPast(data: Gettable<Data>, ): Patch<Data> | null {
      return {
        viewData: {
          showPast: set(!data(d => d.viewData.showPast, false))
        }
      }
    }
  },
  removeDeliverable: {
    storeOnLog: true,
    func: function removeDeliverable<T extends keyof Project>(data: Gettable<Data>, epicId: string, deliverableId: string): Patch<Data> | null {
      if (data(sd => sd.summaries.perDeliverable[deliverableId].totalTracked, 0) > 0) {
        alert("Hours have already been assigned to this deliverable for work on this epic. It can no longer be removed")
      } else if (data(sd => sd.summaries.perDeliverable[deliverableId].totalPlanned, 0) > 0) {
        alert("There are still hours planned on this deliverable. Please remove them before removing this deliverable")
      } else {
        const deliverable = data(sd => sd.deliverables[deliverableId], undefined)
        const epic = data(sd => sd.epics[epicId], undefined)
        if (deliverable === undefined || epic === undefined) {
          return null
        } else if (confirm(`The deliverable ${deliverable.label} will no longer provide budget for ${epic.label}?`)) {
          return {
            budgetAssignments: {
              [epicId]: {
                [deliverableId]: remove()
              }
            }
          }
        }
      }
      return null;
    }
  },
  setProjectProp: {
    storeOnLog: true,
    func: function setProjectProp<T extends keyof Project>(
      data: Gettable<Data>,
      id: string,
      propName: T,
      value: Project[T]
    ): Patch<Data> | null {
      let newValue: Replacer<string | number | boolean> | null
      if (propName === "done") {
        newValue = set(!value)
      } else if (propName === "movedTo") {
        let p = window.prompt("", value === undefined ? "" : (value + ""));
        if (p === null) {
          newValue = null
        } else if (p === "") {
          newValue = remove()
        } else {
          p = p.toUpperCase()
          if (data(sd => sd.projects)[p] !== undefined) {
            newValue = set(p)
          } else {
            alert(`No project in the list has "${p}" as shorthand`)
            newValue = null
          }
        } 
      } else if (propName === "hoursAvailable") {
        const promptResult = window.prompt("", value + "");
        if (promptResult != null && !isNaN(+promptResult)) {
          newValue = set(+promptResult)
        } else {
          newValue = null
        }
      } else if (propName === "label") {
        const p = window.prompt("", value + "");
        if (p === null) {
          newValue = null
        } else {
          if (Object.keys(data(sd => sd.projects)).some(x => data(sd => sd.projects[x].label) === p )) {
            alert("A project with that label already exists")
            newValue = null
          } else {
            
          }
          newValue = set(p)
        }
      } else {
        const p = window.prompt("", (value||"") + "");
        if (p === null) {
          newValue = null
        } else {
          newValue = set(p)
        }
      }
      if (newValue !== null) {
        return {
          projects: {
            [id]: {
              deliverables: {},
              done: false,
              group: "NEW",
              hoursAvailable: 0,
              label: id,
              shortHand: id,
              [propName]: newValue
            }
          }
        }
      } else {
        return null
      }
    },
  },
  setDeliverableProp: {
    storeOnLog: true,
    func: function setDeliverableProp<T extends keyof Deliverable>(
      data: Gettable<Data>,
      projectId: string,
      deliverableId: string,
      propName: T,
      value: Deliverable[T],
    ): Patch<Data> | null {
      const newValue = propName === "done" ? !value : window.prompt("", (value || "") + "");
      console.log(propName, value, newValue)
      if (newValue != null) {
        return {
          deliverables: {
            [deliverableId]: {
              description: "",
              done: false,
              label: deliverableId,
              [propName]: set(newValue),
            }
          }
        }
      } else {
        return null
      }
    },
  },
  addDeliverable: {
    storeOnLog: true,
    func: function addDeliverable(data: Gettable<Data>, projId: string): Patch<Data> | null {
      const project = data(data => data.projects[projId])
      if (project === undefined) {
        return null
      } else {
        const prompt = window.prompt("What's the shortname for the deliverable");
        if (prompt == null || prompt == "") {
          return null
        } else {
          let num = 1;
          const deliverables = data(data => data.deliverables)
          const delId = (n: number) => projId + "-" + zeroPad(num)
          while (deliverables[delId(num)]) {
            num++;
          }
          return {
            projects: {
              [projId]: {
                deliverables: {
                  [delId(num)]: true
                },
                done: false,
                group: "NEW",
                label: projId,
                shortHand: projId,
                hoursAvailable: 0
              }
            },
            deliverables: {
              [delId(num)]: {
                description: prompt,
                done: false,
                label: prompt,    
              }
            }
          }
        }  
      }
      
    },
  },
  //FIXME: remove while loops and replace with somthing like a GUID
  setSprintEnabled: {
    storeOnLog: true,
    func: function setSprintEnabled(data: Gettable<Data>, epicId: string, deliverableId: string, sprintId: string, teamId: string): Patch<Data> | null {
      const own = data<SolverSetting, undefined>(data => data.budgetAssignments[epicId][deliverableId].perSprint[sprintId][teamId], undefined)
      if (own === undefined) {
        return {
          budgetAssignments: {
            [epicId]: {
              [deliverableId]: {
                perSprint: {
                  [sprintId]: {
                    [teamId]: set({"type": "solveable"})
                  }
                }
              }
            }
          }
        }
      } else if (own.type === "solveable") {
        return {
          budgetAssignments: {
            [epicId]: {
              [deliverableId]: {
                perSprint: {
                  [sprintId]: {
                    [teamId]: remove()
                  }
                }
              }
            }
          }
        }
      } else {
        return null
      }
    },
  },
  overrideSprintValue: {
    storeOnLog: true,
    func: function setSprintEnabled(data: Gettable<Data>, epicId: string, deliverableId: string, sprintId: string, teamId: string): Patch<Data> | null {
      
      const curValue: string = ifPresentOrElse(
        data<SolverSetting, string | undefined, undefined>(
          data => data.budgetAssignments[epicId][deliverableId].perSprint[sprintId][teamId],
          v => (v.type === "hardcoded" ? v.hardCodedValue + "" : undefined),
          undefined,
        ),
        v => v,
        () => data(d => d.solverResult.solvedValues[epicId][deliverableId][sprintId][teamId], x => x + "", ""),
      );
      
      const prompt = window.prompt("Hours assigned", curValue)
      if (prompt === null) {
        return null
      }
      return {
        budgetAssignments: {
          [epicId]: {
            [deliverableId]: {
              perSprint: {
                [sprintId]: {
                  [teamId]: set((prompt === "" || isNaN(+prompt)) 
                    ? {"type": "solveable"} 
                    : {
                      type: "hardcoded",
                      hardCodedValue: +prompt
                    }
                  )
                }
              }
            }
          }
        }
      }
    },
  },
  editEpicTitle: {
    storeOnLog: true,
    func: function editEpicTitle(data: Gettable<Data>, epicId: string): Patch<Data> | null {
      const epic = data(data=>data.epics[epicId]);
      if (epic !== undefined) {
        const prompt = window.prompt("new name", epic.label);
        if (prompt != null && prompt != "") {
          return {
            epics: {
              [epicId]: {
                label: set(prompt),
                done: false,
                goals: {}
              }
            }
          }
        } else {
          return null
        }
      } else {
        return null
      }
    },
  },
  addEpic: {
    storeOnLog: true,
    func: function addEpic(data: Gettable<Data>): Patch<Data> | null {
      const prompt = window.prompt("new name");
      if (prompt != null && prompt != "") {
        let id = 0;
        while (data(data => data.epics["EPIC-" + zeroPad(id)])) {
          id++;
        }
        return {
          epics: {
            ["EPIC-" + zeroPad(id)]: {
              done: false,
              label: prompt,
              goals: {},
              order: Object.keys(data(sd => sd.viewData.includedTeams)).join(" ")
            }
          }
        }
      } else {
        return null
      }
    },
  },
  addProject: {
    storeOnLog: true,
    func: function addProject(data: Gettable<Data>): Patch<Data> | null {
      const projectShorthand = prompt("What shorthand shall we use?")
      if (projectShorthand == null) {
        return null
      } else if (data(sd => sd.projects).hasOwnProperty(projectShorthand)) {
        alert("Project with this shorthand already exists")
        return null
      } else {
        return {
          projects: {
            [projectShorthand]: {
              deliverables: {},
              done: false,
              group: "NEW",
              hoursAvailable: 0,
              label: projectShorthand,
              shortHand: projectShorthand
            }
          }
        }
      }
    }
  },
  addEpicDeliverable: {
    storeOnLog: true,
    func: function addEpicDeliverable(data: Gettable<Data>, epicId: string, deliverableId: string): Patch<Data> | null {
      return {
        budgetAssignments: {
          [epicId]: {
            [deliverableId]: {
              perSprint: {}
            }
          }
        }
      }
    }
  },
  setMaxAssignment: {
    storeOnLog: true,
    func: function setMaxAssignment(data: Gettable<Data>, epicId: string, deliverableId: string): Patch<Data> | null {
      const curValue = ifPresentOrElse(
        data(sd => sd.budgetAssignments[epicId][deliverableId].max),
        v => v + "",
        () => data(sd => sd.summaries.perEpic[epicId].perDeliverable[deliverableId].totalPlanned, 
          v => v + "", 
          ""
        )
      )
      const newValue = prompt("Maximum assignment to this epic", curValue)
      if (newValue === "") {
        return {
          budgetAssignments: {
            [epicId]: {
              [deliverableId]: {
                max: remove(),
                perSprint: {}
              }
            }
          }
        }
      } else if (newValue != null && !isNaN(+newValue)) {
        return {
          budgetAssignments: {
            [epicId]: {
              [deliverableId]: {
                max: set(+newValue),
                perSprint: {}
              }
            }
          }
        }
      } else {
        return null 
      }
    }
  },
  toggleExpansion: {
    storeOnLog: false,
    func: function toggleExpansion(data: Gettable<Data>, sprint: string, team?: string): Patch<Data> | null {
      return {
        viewData: {
          expansions: {
            projects: {},
            sprints: {
              [sprint]: {
                perTeam: {
                  ...(team === undefined ? {} : {[team]: set(data(d => d.viewData.expansions.sprints[sprint].perTeam[team], v => !v, true))})
                },
                expanded: team === undefined ? set(data(d => d.viewData.expansions.sprints[sprint].expanded, v => !v, true)) : true
              }
            }
          },
        }
      }
    }
  },
  toggleProjectExpansion: {
    storeOnLog: false,
    func: function toggleProjectExpansion(data: Gettable<Data>, group: string, project?: string): Patch<Data> | null {
      return {
        viewData: {
          expansions: {
            projects: {
              [group]: {
                expanded: project === undefined ? set(data(d => d.viewData.expansions.projects[group].expanded, false)) : true,
                perProject: {
                  ...(project === undefined ? {} : {[project]: set(data(d => d.viewData.expansions.projects[group].perProject[project], false))})
                }
              }
            },
            sprints: {}
          },
        }
      }
    }
  },
  setEpicOrder: {
    storeOnLog: true,
    func: function setEpicOrder(data: Gettable<Data>, epicId: string, order: string | undefined): Patch<Data> | null  {
      const newOrder = prompt("", (order || "") + "")
      if (newOrder !== null && data(sd => sd.summaries.availableTeams).some(t => newOrder.indexOf(t) > -1)) {
        return {
          epics: {
            [epicId]: {
              done: false,
              goals: {},
              label: epicId,
              order: newOrder === "" ? remove() : set(newOrder) 
            }
          }
        }
      }
      return null
    }
  },
  toggleTeam: {
    storeOnLog: false,
    func: function toggleTeam(data: Gettable<Data>, teamId: string): Patch<Data> | null {
      if (Object.keys(data(sd => sd.viewData.includedTeams)).length < 2 && data(sd => sd.viewData.includedTeams[teamId], false) === true) {
        return null
      } else {
        return {
          viewData: {
            includedTeams: {
              [teamId]: ifPresentOrElse(data(data => data.viewData.includedTeams[teamId]), v => remove(), () => set(true))
            }
          }
        }
      }
    }
  },
  trackHours: {
    storeOnLog: true,
    func: function trackHours(data: Gettable<Data>, memberId: string, teamId: string, year: number, week: number, day: number, projectId: string, epicId: string | undefined, value: string): Patch<Data> | null {
      const parsedTime = parseTime(value) 
      if (parsedTime === undefined) {
        return null
      }
      return {
        trackedTime: {
          [year]: {
            [week]: {
              0: {},
              1: {},
              2: {},
              3: {},
              4: {},
              [day]: {
                [teamId]: {
                  [memberId]: {
                    [projectId]: epicId === undefined ? {
                      perEpic: {},
                      direct: set(parsedTime)
                    } : {
                      perEpic: {
                        [epicId]: set(parsedTime)
                      },
                      direct: 0,
                    }
                  }  
                }
              }
            }
          }
        }
      }
    }    
  },
  setTab: {
    storeOnLog: false,
    func: function setTab(data: Gettable<Data>, tabid: string): Patch<Data> | null {
      console.log("setting", tabid)
      return {
        viewData: {
          currentTab: set(tabid),
          endSprint: "",
          expansions: {
            projects: {},
            sprints: {}
          },
          includedTeams: {},
          isConnected: false,
          startSprint: ""
        }
      }
    }
  },
  setWorkDayOverride: {
    storeOnLog: true,
    func: function setWorkDayOverride(data: Gettable<Data>, user: string, sprint: string, day: number, value: string, team: string): Patch<Data> | null {
      const newVal = parseTime(value);
      if (newVal !== undefined) {
        const dayplanning: Patch<DayPlanning> = {
          [team]: set(newVal)
        }
        const replacement: Patch<WeekOverride> = [];
        replacement[day] = dayplanning
        // return {
        //   calendar: {
        //     [user]: {
        //       exceptions: {
        //         [sprint]: replacement
        //       },
        //       templates: {}
        //     }
        //   }
        // }
        return {
          calendar: {
            [user]: {
              employeefullname: "<unknown>",
              employeenr: "<unknown>",
              exceptions: {
                [sprint]: [
                  day === 1 ? {[team]: set(newVal)} : null,
                  day === 2 ? {[team]: set(newVal)} : null,
                  day === 3 ? {[team]: set(newVal)} : null,
                  day === 4 ? {[team]: set(newVal)} : null,
                  day === 5 ? {[team]: set(newVal)} : null,
                ]
              },
              templates: {}
            }
          }
        }
      } else {
        return null
      }
  
    }
  }
}


export function makeMutators(startData: Gettable<Data>, newDataCreated: (data: Patch<Data>, storeOnLog: boolean) => void) {
  return mutatorFactory(startData, newDataCreated, mutatorSpec);
}

function mutatorFactory<T extends mutatorsSpec<Data>>(startData: Gettable<Data>, newDataCreated: (data: Patch<Data>, storeOnLog: boolean) => void, mutatorSpec: T): CallableMutators<T, Data> {
  const result: any = {}
  for (const key in mutatorSpec) {
    result[key] = function () {
      const args = Array.prototype.slice.call(arguments);
      return function () {
        if (startData(d => d.viewData.isConnected)) {
          const newLocal = mutatorSpec[key];
          const result = newLocal.func.call(null, startData, ...args)
          if (result != null) {
            newDataCreated(result, mutatorSpec[key].storeOnLog)
          }  
        }
      }
    }
  }
  return result
}
