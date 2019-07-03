import {
  Data,
  Summaries,
  Calendar,
  DayPlanning,
  Projects,
  Calendars,
  AssignmentSummary,
  TrackedTime,
} from "./datamodel";
import { loopOver, ifPresentOrIgnore } from "../tools/data-access";
import { Solver, Expression, Variable, Constraint, Operator, Strength } from "../kiwi/index";
import { zeroPad } from "../tools/zeroPad";
import { sett, Gettable } from "../tools/getset";
import { getProject } from "../getProject";
import { applyPatch, set } from "../patch/patch";
import { getSprints } from "./sprints";
import { getWeekYear, getWeek, getDayOfWeek, minutesToHourFractions, getFirstWeekOfSprint } from "./date-calc";
import { ic } from "../tools/icecream";

export function recalculate(data: Data, sd: Gettable<Data>) {
  data.summaries = {
    projectsWithHoursDirectlyAssigned: {},
    teamAssignments: {},
    groupedProjects: {},
    availableTeams: [],
    perEpic: {},
    perProject: {},
    perSprint: {},
    perDeliverable: {},
  };
  updateAvailableTeams(data);
  updateAssignedTeams(data);
  updateWorkableHourSummary(data);
  updateRemainingHoursSummary(data);
  updateGroupedProjects(data);
  solve(data, sd);
  updateAssignedHoursSummary(data);
  mapTimeTellToSprint(data, data.timetellImport, data.summaries.teamAssignments, data.calendar)
}

function updateAssignedTeams(data: Data) {
  loopOver(data.budgetAssignments, (deliverables, epicId) => {
    loopOver(deliverables, (perDeliverable, deliverableId) => {
      loopOver(perDeliverable.perSprint, (teams, sprintId) => {
        loopOver(teams, (value, teamId) => {

          applyPatch(data.summaries, {
            perEpic: {
              [epicId]: {
                "perDeliverable": {
                  [deliverableId]: {
                    assignedTeams: {
                      [teamId]: set(true as const),
                    },
                    totalPlanned: 0,
                  },
                },
                perGoal: {},
              },
            },
            perDeliverable: {
              [deliverableId]: {
                totalPlanned: 0,
                totalTracked: 0,
                assignedTeams: {
                  [teamId]: set(true as const),
                },
              },
            },
            availableTeams: [],
            groupedProjects: {},
            perProject: {},
            perSprint: {},
          });
        });
      });
    });
  });
}

export function getYearsWithProjects(minYear: number, maxYear: number, projects: Projects) {
  let startYear = minYear;
  let endYear = minYear;
  loopOver(projects, proj => {
    const fromYear = new Date(proj.availableFrom || "").getFullYear();
    const untilYear = new Date(proj.availableUntil || "").getFullYear();
    if (fromYear > startYear) {
      startYear = fromYear;
    }
    if (untilYear > endYear) {
      endYear = untilYear;
    }
  });
  if (endYear > maxYear) {
    endYear = maxYear;
  }
  const years: number[] = [];
  for (let i = startYear; i <= endYear; i++) {
    years.push(i);
  }
  return years;
}

function asProjection() {
  

  /* The structure below is transformed
    the object tree is turned into a setter function that is parametrized along the each() functions
      - that setter function might memoize to not continuously check whether the parts exist. 
      - It might be dynamically programmed to only check on variables segements
    The apply calls return a Transformer object that receives the setter function
      - The Transformer object is not location dependent
        - that's just too hard. 
        - Typing a bit more is no problem, but this does make it impossible to encapsulate a subtree in a re-usable component
      - The Transformer object reports what paths it listens to. These paths will be subscribed to in a central registration
      - If a setter writes to a path that was already subscribed to it needs to add (maybe push) onto the subscription 
        registration so that the previously registered subscription is not triggered by a downstream setter
      - When a patch is applied it calls all subscriptions in place 0 of the central subscription tree with the new value
      - the subscription then queues the transformer with the new value. It should be able to do so with the correct 
        slots on the subscription. So if the input variable that depends on epicId and sprintId changes it should say to 
        the transformer: new value for variable 0 with epicId = foo and sprintId = bar. and later: new value for 
        variable 0 with epicId = foo and deliverableId = cux it is up to the transformer to take action. apply() might 
        update the values array and call the transformation function 
      - unbound 'each' variables should throw a runtime error

      this means I group the subscriptions on overlapping variables. WHat if the overlap is bot contguous

      1 prop1[a]
      2 prop2[a][b]
      3 prop3[b]

      This function will be called once for each permutation of a and b, with 1 and 3 often the same

      so when I change 1, I need to re-call the function for all b's (with the new a)
      so when I change 3, I need to re-call the function for all a's (with the new b)
      if I change one and 3 I need to re-call entirely

      {
        prop1: { foo: 1}
        prop2: { foo: {bar: 4, baz: 5}, qux: {baz: 3, spam: 6} } //so not all permutations are present here
        prop3: { bar: 4, baz: 2}
      }

      so a can be [foo, qux] and b can be [bar, baz, spam]
      or put differently
      1 has [{a: foo}]
      2 has [{a: foo, b: bar}, {a: foo, b: baz}, {a: qux, b: baz}, {a: qux, b: spam}]
      3 has [{b: bar}, {b: baz}]

      the result is assigned at 
      {
        prop4: {
          [a]: {
            [b]: <result here>
          }
        }
      }
      so the function is called initially with

      (prop1.foo, prop2.foo.bar, prop3.bar)
      (prop1.foo, prop2.foo.baz, prop3.baz)
      (prop1.foo, prop2.foo.spam, prop3.spam)
      (prop1.qux, prop2.qux.bar, prop3.bar)
      (prop1.qux, prop2.qux.baz, prop3.baz)
      (prop1.qux, prop2.qux.spam, prop3.spam)

      the we change a source value.

      prop1.foo = 3: 1 is triggered. we want to make sure that the function is called with
      (prop1.foo, prop2.foo.bar, prop3.bar)
      (prop1.foo, prop2.foo.baz, prop3.baz)
      (prop1.foo, prop2.foo.spam, prop3.spam)
      i.e. add all permutations of keys where a is fixed to foo to the list

      We need to delay the permutation expansion otherwise we might have a race condition. so we need to add 
      {a: foo, b: *} to the list

      if 2 is then triggered (prop2.foo.bar = 1) we want to make sure that the function is called with
      (prop1.foo, prop2.foo.bar, prop3.bar)
      So we can add {a: foo, b: bar} to the list and ideally have it fizzle because b* is already added

      When 3 is triggered (prop3.bar = 1) we want to make sure that the function is called with
      (prop1.foo, prop2.foo.bar, prop3.bar)
      (prop1.qux, prop2.qux.bar, prop3.bar)

      So we can add {a: any, b: bar} to the list, but this cannot fizzle (we add new a's by adding a:any)

      So we need a way to store these ways of calling them and easily deduplicating
      

      at the first i want to store that I want 
        - all b's in the context of a specific a 
        - a specifc a and b where the a is matched by the specific a of the first and the b matched by the specific b of the third
        - all a's in the context of a specific b

      So I want to call this with all a's for b=bar, all b's for a=foo and a=foo, b=bar

      [_  , _  , baz]
      [foo, _  , _  ]
   // [foo, _  , baz]
   // [foo, bar, baz]

      An array is added if for all existing lines it is the case that any of the items is more generic (or different) then the existing items

      I want a pattern that can match strings (arrays of unique symbols) and other patterns
      {
        "baz": [false, false, true],
      }

      {
        "foo": [true, false, false],
      }

      {
        "foo": [true, false, false],
        "baz": [false, false, true],
      }

      {
        "foo": [true, false, false],
        "bar": [false, true, false],
        "baz": [false, false, true],
      }
      //if the keys are nonexistent 


  const summaries = project(data, {
    summaries: {
      perEpic: each(
        epicId => ({
          perDeliverable: each(
            deliverableId => ({
              assignedTeams: each(
                teamId => apply(
                  [
                    (data, [sprintId]) => data.budgetAssignments[epicId][deliverableId].perSprint[sprintId][teamId], 
                    (data, [sprintId]) => data.budgetAssignments[epicId].perSprint[sprintId][teamId], 
                  ],
                  ([values]) => values.length === 0
                )
              )
            })
          )
        })
      ),
      perDeliverable: each(deliverableId => ({
        assignedTeams: each(teamId => apply(
          [
            (data, [epicId, sprintId]) => data.budgetAssignments[epicId][deliverableId].perSprint[sprintId][teamId]
          ],
          ([values]) => values.length === 0
        ))
      })),
      perSprint: each(sprintId => ({
        workableAndAssigned: {
          teamTotals: each(teamId => ({
            totalAssignedHours: apply(
              [
                (data, [epicId, deliverableId]) => data.solverResult.solvedValues[epicId][deliverableId][sprintId][teamId]
              ],
              ([values]) => values.reduce((p,c) => p+c, 0)
            )
          }))
        }
      }))
    }
  })
  */

}

function updateAssignedHoursSummary(data: Data) {
  loopOver(data.solverResult.solvedValues, (epic, epicId) => {
    loopOver(epic, (deliverable, deliverableId) => {
      loopOver(deliverable, (teams, sprintId) => {
        loopOver(teams, (assignedValue, teamId) => {
          sett(data.summaries.perSprint)(sprintId)("workableAndAssigned", {
            availableTeamsAndMembers: {},
            trackedTime: {},
            solved: { perEpic: {} },
          })("teamTotals", { perEpic: {} })(teamId)("totalAssignedHours", { perMember: {} }).update(
            0,
            x => x + assignedValue,
          );

          ifPresentOrIgnore(
            data.summaries.perSprint[sprintId]!.workableAndAssigned.teamTotals[teamId]!.totalworkableHours,
            v => {
              let curRemaining = data.summaries.perSprint[sprintId]!.workableAndAssigned.teamTotals[teamId]!
                .totalRemainingHours;
              if (curRemaining === undefined) {
                curRemaining = v;
              }
              data.summaries.perSprint[sprintId]!.workableAndAssigned.teamTotals[teamId]!.totalRemainingHours =
                curRemaining - assignedValue;
            },
          );
          sett(data.summaries.perSprint)(sprintId)("workableAndAssigned", {
            availableTeamsAndMembers: {},
            trackedTime: {},
            solved: { perEpic: {} },
          })("perEpic", { teamTotals: {} })(epicId)("totalAssigned", { perGoal: {} }).update(0, x => x + assignedValue);

          sett(data.summaries.perEpic)(epicId)("perDeliverable", { perGoal: {} })(deliverableId)("totalPlanned", {
            assignedTeams: {},
          }).update(0, v => v + assignedValue);

          sett(data.summaries.perDeliverable)(deliverableId)("totalPlanned", { assignedTeams: {}, totalTracked: 0 }).update(
            0,
            v => v + assignedValue,
          );

          const [projId, proj] = getProject(deliverableId, data.projects);
          if (projId !== undefined) {
            sett(data.summaries.perProject)(projId)("totalPlanned", { budgetRemaining: 0, sumTimeTell: 0 }).update(
              0,
              v => v + assignedValue,
            );
          }
        });
      });
    });
  });

  loopOver(data.summaries.perSprint, sprint => {
    let sprintTotal = 0;
    let hasValue = false;
    loopOver(sprint.workableAndAssigned.perEpic, epic => {
      ifPresentOrIgnore(epic.totalAssigned, v => {
        sprintTotal += v;
        hasValue = true;
      });
    });
    if (hasValue) {
      sprint.workableAndAssigned.totalAssignedHours = sprintTotal;
      if (sprint.workableAndAssigned.totalworkableHours !== undefined) {
        sprint.workableAndAssigned.totalRemainingHours = sprint.workableAndAssigned.totalworkableHours - sprintTotal;
      }
    }
  });
  setHoursAvailable(data.summaries.perProject, data.projects);
}

function setHoursAvailable(projectSummary: Data["summaries"]["perProject"], projects: Projects) {
  loopOver(projectSummary, (projectSummary, id) => {
    const projSettings = projects[id];
    const hoursAssigned = projSettings === undefined ? 0 : projSettings.hoursAvailable;

    projectSummary.budgetRemaining = hoursAssigned - projectSummary.sumTimeTell - projectSummary.totalPlanned;
  });
}

function updateAvailableTeams(data: Data) {
  const teams: { [team: string]: boolean } = {};
  loopOver(data.calendar, (cal, memberId) => {
    loopOver(cal.templates, template => {
      for (const day of template) {
        loopOver(day, (_amount, teamId) => {
          teams[teamId] = true;
        });
      }
    });
  });
  data.summaries.availableTeams = Object.keys(teams);
}

function updateWorkableHourSummary(data: Data) {
  loopOver(data.sprintPlanning, (weeks, year) => {
    data.summaries.teamAssignments[year] = {}
    let prevSprintId: string | undefined = undefined;
    loopOver(weeks, (sprintId, week) => {
      if (prevSprintId===undefined) {
        prevSprintId = sprintId
      }
      data.summaries.teamAssignments[year][week] = {
        perMember: {},
        perTeam: {}
      }
      loopOver(data.calendar, (calendar, memberId) => {
        const workWeek = getWorkHours(calendar, +year, +week)
        for (let day = 0; day < workWeek.length; day++) {
          const planning = workWeek[day]
          if (data.summaries.teamAssignments[year][week].perMember[memberId] == undefined) {
            data.summaries.teamAssignments[year][week].perMember[memberId] = [{}, {}, {}, {}, {}]
          }
          if (planning !== null) {
            loopOver(planning, (amount, teamId) => {
              if (data.summaries.teamAssignments[year][week].perTeam[teamId] == undefined) {
                data.summaries.teamAssignments[year][week].perTeam[teamId] = [{}, {}, {}, {}, {}]
              }
              data.summaries.teamAssignments[year][week].perMember[memberId][day][teamId] = true
              data.summaries.teamAssignments[year][week].perTeam[teamId][day][memberId] = true

              sett(data.summaries.perSprint)(sprintId)("workableAndAssigned", {
                availableTeamsAndMembers: {},
                trackedTime: {},
                solved: { perEpic: {} },
              })("teamTotals", { perEpic: {} })(teamId)("perMember", {})(memberId)("totalworkableHours").update(
                0,
                cur => cur + amount,
              );
              sett(data.summaries.perSprint)(sprintId)("availableTeamsAndMembers", {
                workableAndAssigned: { teamTotals: {}, perEpic: {} },
                trackedTime: {},
                solved: { perEpic: {} },
              })(teamId)(memberId).assign(true);
            });
          }
        }
      });
      if (sprintId !== prevSprintId && prevSprintId !== undefined) {
        ifPresentOrIgnore(data.summaries.perSprint[prevSprintId], sprintSummary => {
          let sprintTotal = 0;
          let sprintHasValue = false;
          loopOver(sprintSummary.workableAndAssigned.teamTotals, (teamTotal, teamId) => {
            let total = 0;
            let hasValue = false;
            loopOver(teamTotal.perMember, (member, memberId) => {
              if (member.totalworkableHours != undefined) {
                total += member.totalworkableHours;
                hasValue = true;
              }
            });
            if (hasValue) {
              teamTotal.totalworkableHours = total;
              if (teamTotal.totalAssignedHours !== undefined) {
                teamTotal.totalRemainingHours = total - teamTotal.totalAssignedHours;
              }
              sprintTotal += total;
              sprintHasValue = true;
            }
          });
          if (sprintHasValue) {
            sprintSummary.workableAndAssigned.totalworkableHours = sprintTotal;
            if (sprintSummary.workableAndAssigned.totalAssignedHours !== undefined) {
              sprintSummary.workableAndAssigned.totalRemainingHours =
                sprintTotal - sprintSummary.workableAndAssigned.totalAssignedHours;
            }
          }
        });
        prevSprintId = sprintId;
      }
    });
  });
}

export function getWorkHours(calendar: Calendar, year: number, week: number) {
  const weekDesc = getWeekKey(year, week);
  const result: [DayPlanning | null, DayPlanning | null, DayPlanning | null, DayPlanning | null, DayPlanning | null] = [
    null,
    null,
    null,
    null,
    null,
  ];
  for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
    const weekException = calendar.exceptions[weekDesc];
    const curDayException = weekException && weekException[dayIndex];
    if (curDayException != null) {
      result[dayIndex] = curDayException;
    } else {
      const template = findTemplate(weekDesc, calendar);
      if (!template) {
        result[dayIndex] = null;
      } else {
        result[dayIndex] = template[dayIndex];
      }
    }
  }
  return result;
}

export function getWeekKey(year: number, week: number) {
  return year + "-W" + zeroPad(week);
}

function findTemplate(weekDesc: string, calendar: Calendar) {
  const sortedTemplates = Object.keys(calendar.templates).sort();
  let curTemplate: string | undefined = undefined;
  if (sortedTemplates[0] <= weekDesc) {
    curTemplate = sortedTemplates[0];
  }
  for (const template of sortedTemplates) {
    if (weekDesc > template) {
      break;
    } else {
      curTemplate = template;
    }
  }
  return curTemplate ? calendar.templates[curTemplate] : undefined;
}

function calcRemaining(summary: {
  totalworkableHours?: number;
  totalAssignedHours?: number;
  totalRemainingHours?: number;
}) {
  if (summary.totalworkableHours != null || summary.totalAssignedHours != null) {
    summary.totalRemainingHours = (summary.totalworkableHours || 0) - (summary.totalAssignedHours || 0);
  }
}
function updateRemainingHoursSummary(data: Data) {
  loopOver(data.summaries.perSprint, sprintSummary => {
    calcRemaining(sprintSummary.workableAndAssigned);
    loopOver(sprintSummary.workableAndAssigned.teamTotals, teamSummary => {
      calcRemaining(teamSummary);
      loopOver(teamSummary.perMember, memberSummary => {
        calcRemaining(memberSummary);
      });
    });
  });
}

function updateGroupedProjects(data: Data) {
  const intermediate: Summaries["groupedProjects"] = {};
  loopOver(data.projects, (proj, id) => {
    if (!intermediate[proj.group]) {
      intermediate[proj.group] = { projects: {}, deliverablesCount: 0 };
    }
    intermediate[proj.group].projects[id] = proj;
    intermediate[proj.group].deliverablesCount += Object.keys(proj.deliverables).length + 1;
  });
  //sort keys:
  for (const key of Object.keys(intermediate).sort()) {
    data.summaries.groupedProjects[key] = intermediate[key];
  }
}

function solve(data: Data, sd: Gettable<Data>) {
  var solver = new Solver();
  //create a variable per epic per deliverable per available sprint
  const sprintTotals: { [sprintId: string]: { [teamId: string]: Expression } } = {};
  const projectTotals: { [projectId: string]: Expression } = {};
  const variables: {
    [epicId: string]: { [deliverableId: string]: { [sprintId: string]: { [teamId: string]: Variable } } };
  } = {};
  const curDate = new Date();
  const curYear = getWeekYear(curDate);
  const curWeek = getFirstWeekOfSprint(curYear, getWeek(curDate), data.sprintPlanning);
  loopOver(data.budgetAssignments, (deliverables, epicId) => {
    const epicResult = data.solverResult.solvedValues[epicId];
    loopOver(deliverables, (deliverableInfo, deliverableId) => {
      const deliverableResult = epicResult && epicResult[deliverableId];
      const projInfo = getProject(deliverableId, data.projects);
      if (projInfo[0] === undefined) {
        return;
      }
      const [projId, proj] = projInfo;
      let deliverableAssignmentTotal: Expression = new Expression();
      const allSprintAssignment: Variable[] = [];
      // let deliverableTotal: Expression | undefined = undefined;
      for (const sprint of getSprints(data.sprintPlanning, curYear, curWeek)) {
        const sprintId = sprint.sprintId;
        const teams = deliverableInfo.perSprint[sprintId];
        if (teams === undefined) {
          continue;
        }
        loopOver(teams, (config, teamId) => {
          const sprintResult = deliverableResult && deliverableResult[sprintId] && deliverableResult[sprintId]![teamId];
          const variable = new Variable();
          allSprintAssignment.push(variable);
          solver.addConstraint(new Constraint(variable, Operator.Ge, new Expression(0), Strength.required));
          deliverableAssignmentTotal = deliverableAssignmentTotal.plus(variable);
          if (!variables[epicId]) {
            variables[epicId] = {};
          }
          if (!variables[epicId][deliverableId]) {
            variables[epicId][deliverableId] = {};
          }
          if (!variables[epicId][deliverableId][sprintId]) {
            variables[epicId][deliverableId][sprintId] = {};
          }
          variables[epicId][deliverableId][sprintId][teamId] = variable;
          if (!projectTotals[projId]) {
            projectTotals[projId] = new Expression(variable);
          } else {
            projectTotals[projId] = projectTotals[projId].plus(variable);
          }
          if (!sprintTotals[sprintId]) {
            sprintTotals[sprintId] = {};
          }
          if (!sprintTotals[sprintId][teamId]) {
            sprintTotals[sprintId][teamId] = new Expression(variable);
          } else {
            sprintTotals[sprintId][teamId] = sprintTotals[sprintId][teamId].plus(variable);
          }
          if (config.type === "solveable") {
            solver.addEditVariable(variable, Strength.weak);
            if (sprintResult) {
              solver.suggestValue(variable, sprintResult);
            }
          } else {
            solver.addConstraint(
              new Constraint(
                variable,
                Operator.Eq,
                new Expression(config.hardCodedValue),
                Strength.strong, //Strong because we otherwise you might cause the solver to be unsolveable
              ),
            );
          }
        });
      }
      if (deliverableInfo.max !== undefined) {
        solver.addConstraint(
          new Constraint(
            deliverableAssignmentTotal,
            Operator.Le,
            new Expression(deliverableInfo.max),
            Strength.required,
          ),
        );
        const assignmentsToSpreadOver = Object.keys(deliverableInfo.perSprint)
          .map(sprintId => deliverableInfo.perSprint[sprintId])
          .map(sprint => (sprint == undefined ? 0 : Object.keys(sprint).length))
          .reduce((s, c) => s + c, 0);
        for (const variable of allSprintAssignment) {
          solver.addConstraint(
            new Constraint(
              variable,
              Operator.Le,
              new Expression(deliverableInfo.max).divide(assignmentsToSpreadOver),
              Strength.medium,
            ),
          );
        }
      }
      if (projectTotals[projId]) {
        const budgetRemaining = sd(
          sd => sd.summaries.perProject[projId].budgetRemaining,
          sd(sd => sd.projects[projId].hoursAvailable, 0),
        );
        solver.addConstraint(
          new Constraint(projectTotals[projId], Operator.Le, new Expression(budgetRemaining), Strength.required),
        );
        solver.addConstraint(
          new Constraint(
            projectTotals[projId],
            Operator.Eq,
            new Expression(budgetRemaining),
            Strength.medium, //This is preferred, but not necessary
          ),
        );
      }
    });
  });
  loopOver(sprintTotals, (teams, sprintId) => {
    loopOver(teams, (variable, teamId) => {
      const workableHours = sd(
        x => x.summaries.perSprint[sprintId].workableAndAssigned.teamTotals[teamId].totalworkableHours,
        0,
      );
      solver.addConstraint(
        new Constraint(
          variable,
          Operator.Le,
          new Expression(workableHours || 0),
          Strength.required, //we can't go over
        ),
      );
      solver.addConstraint(
        new Constraint(
          variable,
          Operator.Eq,
          new Expression(workableHours || 0),
          Strength.medium, //we should really try to fill the sprint, but manually asserted values are stronger
        ),
      );
    });
  });

  // Solve the constraints
  solver.updateVariables();
  data.solverResult.solvedValues = {};
  loopOver(variables, (v, epicId) => {
    data.solverResult.solvedValues[epicId] = {};
    loopOver(v, (v, deliverableId) => {
      data.solverResult.solvedValues[epicId]![deliverableId] = {};
      loopOver(v, (v, sprintId) => {
        data.solverResult.solvedValues[epicId]![deliverableId]![sprintId] = {};
        loopOver(v, (variable, teamId) => {
          const floored = Math.floor(variable.value());
          sett(data.summaries.perSprint)(sprintId)("solved", {
            workableAndAssigned: { perEpic: {}, teamTotals: {} },
            trackedTime: {},
            availableTeamsAndMembers: {},
          })("total", { perEpic: {} }).update(0, v => v + floored);
          sett(data.summaries.perSprint)(sprintId)("solved", {
            workableAndAssigned: { perEpic: {}, teamTotals: {} },
            trackedTime: {},
            availableTeamsAndMembers: {},
          })("perEpic", {})(epicId).update(0, v => v + floored);
          data.solverResult.solvedValues[epicId]![deliverableId]![sprintId]![teamId] = floored;
        });
      });
    });
  });
}

function mapTimeTellToSprint(
  data: Data,
  timetellImport: Data["timetellImport"],
  teamAssignments: AssignmentSummary,
  employeeInfo: Calendars,
) {
  //construct a lookup table detailing who worked when for what team
  const memberForEmployeeName: {[employeeName: string]: string} = {};
  loopOver(employeeInfo, (info, memberId) => {
    memberForEmployeeName[info.employeefullname] = memberId
  })
  data.trackedTime = {}//FIXME: remove when we start tracking time by hand
  for (const timetellLine of timetellImport) {
    const memberId = memberForEmployeeName[timetellLine.Medewerker];
    const date = new Date(timetellLine.Datum)
    const year = getWeekYear(date)
    const week = getWeek(date)
    const day = getDayOfWeek(date)
    const sprintId = data.sprintPlanning[year][week]
    const teams = teamAssignments[year][week].perMember[memberId][day]
    //convert to sprint data using supplied function
    const projId = data.projects[timetellLine.Project.proj] !== undefined ? data.projects[timetellLine.Project.proj]!.movedTo || timetellLine.Project.proj : timetellLine.Project.proj;
    const {epicId, teamId} = getEpicAssignment(date, year, week, day, memberId, teams, projId, timetellLine.Minuten)

    sett(data.summaries.perProject)
      (projId)
      ("sumTimeTell", {budgetRemaining: 0, totalPlanned: 0})
      .update(0, v => v + timetellLine.Minuten)

    sett(data.summaries.perSprint)
      (sprintId)
      ("trackedTime", {workableAndAssigned: {teamTotals: {}, perEpic: {}}, solved: {perEpic: {}}, availableTeamsAndMembers: {}, })
      (teamId)
      ("total", {perEpic: {}, hoursAssignedToProjectsNotEpics: {}})
      .update(0, v => v + timetellLine.Minuten)
    if (epicId === undefined) {
      sett(data.trackedTime)
        (year)
        (week)
        (day, {})
        (teamId)
        (memberId)
        (projId)
        ("direct", {perEpic: {}})
        .assign(timetellLine.Minuten)
      sett(data.summaries.perSprint)
        (sprintId)
        ("trackedTime", {workableAndAssigned: {teamTotals: {}, perEpic: {}}, solved: {perEpic: {}}, availableTeamsAndMembers: {}, })
        (teamId)
        ("hoursAssignedToProjectsNotEpics", {perEpic: {}})
        (projId)
        .update(0, v => v + timetellLine.Minuten)
      sett(data.summaries.projectsWithHoursDirectlyAssigned)
        (projId)
        (teamId)
        .assign(true)
    } else {
      sett(data.trackedTime)
        (year)
        (week)
        (day, {})
        (teamId)
        (memberId)
        (projId)
        ("perEpic", {direct: 0})
        (epicId)
        .assign(timetellLine.Minuten)
      sett(data.summaries.perSprint)
        (sprintId)
        ("trackedTime", {workableAndAssigned: {teamTotals: {}, perEpic: {}}, solved: {perEpic: {}}, availableTeamsAndMembers: {}, })
        (teamId)
        ("perEpic", {hoursAssignedToProjectsNotEpics: {}})
        (epicId)
        .update(0, v => v + timetellLine.Minuten)
    }
  }
  loopOver(data.summaries.perProject, (project, id) => {
    project.sumTimeTell = minutesToHourFractions(project.sumTimeTell);
  });
  setHoursAvailable(data.summaries.perProject, data.projects);
}


function getEpicAssignment(datum: Date, year: number, week: number, day: number, member: string, teams: {[key: string]: true}, projectId: string, minuten: number): {epicId?: string, teamId: string} {
  return {
    teamId: Object.keys(teams)[0]
  }
}