import { FunctionComponent } from "react";
import { renderProjectSidebar } from "./renderProjectSidebar";
import { renderTeamSelector } from "./renderTeamSelector";
import { h } from "../react-hyperscript";
import { Gettable } from "../tools/getset";
import { Data, SolverSetting, EpicMetadata, Deliverable, Project, SprintPlanning } from "../model/datamodel";
import { Mutators } from "../mutators";
import { LoopOver, If, For, With } from "../tools/ArrayExpressions";
import { getSprints } from "../model/sprints";
import { getProject } from "../getProject";
import { countItems } from "./countItems";
import { getWeek, getWeekYear, getMonday, format, getWeekCountForQuarter, minutesToHourFractions, isInPast, getLastWeek, getFirstWeekOfSprint } from "../model/date-calc";
import { zeroPad } from "../tools/zeroPad";

export const renderCapacityPlanning: FunctionComponent<{
  curYear: number;
  sd: Gettable<Data>;
  data: Data;
  mutators: Mutators;
  includedTeams: string[];
}> = function renderCapacityPlanning({ curYear, sd, data, mutators, includedTeams }) {
  const today = new Date()
  const thisYear = getWeekYear(today)

  const thisWeek = getFirstWeekOfSprint(thisYear, getWeek(today), data.sprintPlanning)
  const thisSprint = data.sprintPlanning[thisYear][thisWeek]
  const includedTeamsLength = includedTeams.length;
  const allowPast  = data.viewData.showPast || false;
  const years = Object.keys(data.sprintPlanning)
    .map(x => +x)
    .filter(x => !isNaN(x))
    .filter(x => allowPast || x >= thisYear)
    .map(y => [y, y === thisYear && !allowPast ? getLastWeek(y) - thisWeek + 1 : getLastWeek(y)] as const)
    .sort((a,b) => a[0]-b[0])
  function getQuarters(year: number, allowPast: boolean): Array<[number, number, number]> {
    if (allowPast || year > thisYear) {
      return [
        [year, 1, getWeekCountForQuarter(year, 1)],
        [year, 2, getWeekCountForQuarter(year, 2)],
        [year, 3, getWeekCountForQuarter(year, 3)],
        [year, 4, getWeekCountForQuarter(year, 4)],
      ]
    } else {
      const result: Array<[number, number, number]> = [];
      let startOfQuarter = 1
      for (let q = 1; q <= 4; q++) {
        const weeksInThisQuarter = getWeekCountForQuarter(year, q)
        const endOfQuarter = startOfQuarter + weeksInThisQuarter - 1
        if (startOfQuarter > thisWeek) {
          result.push([year, q, weeksInThisQuarter])
        } else if (endOfQuarter >= thisWeek) {
          result.push([year, q, weeksInThisQuarter - (thisWeek - startOfQuarter)])
        }
        startOfQuarter = endOfQuarter + 1
      }
      return result
    }
  }
  const quarters = years.map(y => getQuarters(y[0], allowPast)).reduce((p, c) => p.concat(c), [])

  const sprints = Array.from(allowPast ? getSprints(data.sprintPlanning) : getSprints(data.sprintPlanning, thisYear, thisWeek))

  return h(
    "div",
    "capacityPlanning",
    ["scrollColumns"],
    [
      h(
        "div",
        "projectSideBar",
        ["left"],
        [h(renderProjectSidebar, "projectSideBarContents", { data, sd, mutators }, [])],
      ),
      h(
        "div",
        "planningTable",
        ["right"],
        [
          h(
            renderTeamSelector,
            "teamSelector",
            { availableTeams: data.summaries.availableTeams, includedTeams: includedTeams, mutators },
            [],
          ),
          h("label", "toggleShowPast", [
            h("input", "checkbox", ["toggleShowPast"], {
              type: "checkbox",
              checked: sd(sd => sd.viewData.showPast, false),
              onChange: mutators.toggleShowPast()
            },  []),
            "Show past"
          ]),
          h("table", "capacityPlanningTable", ["capacityPlanning"], { style: { width: "max-content" } }, [
            h("thead", "head", [
              h("tr", "years", [
                h("th", "padding", { rowSpan: 4, colSpan: 4 }, []),
                ...LoopOver(years, ([year, weeks], _i) => [
                  h(
                    "th",
                    "yr-" + year,
                    {
                      colSpan: weeks * includedTeamsLength,
                    },
                    [year],
                  ),
                ]),
              ]),
              h("tr", "quarters", [
                ...LoopOver(quarters, ([year, quarter, weeks], _i) => [
                  h("th", year + "-q" + quarter, { colSpan: weeks * includedTeamsLength }, [
                    "Q" + quarter,
                  ]),    
                ]),
              ]),
              h("tr", "sprints", [
                ...LoopOver(sprints, ({ sprintId, length, firstWeek, lastWeek, year, number }) => [
                  h("th", year + "-s" + sprintId, { colSpan: length * includedTeamsLength, title: `from ${format(getMonday(year, firstWeek))} until ${format(new Date(getMonday(year, lastWeek).getTime() + 5 * 24 * 60 * 60 * 1000))}` }, [
                    "S" + zeroPad(number),
                  ]),
                ]),
              ]),
              h("tr", "teams", [
                ...LoopOver(sprints, ({ sprintId, length }, year) => [
                  ...LoopOver(includedTeams, team => [
                    h("th", year + "-st" + sprintId + "-" + team, ["teamCol"], { colSpan: length }, [team]),
                  ]),
                ]),
              ]),
              h("tr", "totals", [
                h("th", "epicLabel", {colSpan: 2}, ["epic"]),
                h("th", "deliverableLabel", { colSpan: 2 }, ["deliverables"]),
                ...LoopOver(sprints, ({ sprintId, year, lastWeek, length }) => [
                  ...LoopOver(includedTeams, team => [
                    ...If(
                      isInPast(year, lastWeek, today),
                      () => [
                        h("td", "teamPast-" + sprintId + "-" + team, { colSpan: length }, [
                          sd(sd => sd.summaries.perSprint[sprintId].trackedTime[team].total, v => minutesToHourFractions(v), "")
                        ]),
                      ],
                      () => [
                        ...With(
                          sd(
                            sd =>
                              sd.summaries.perSprint[sprintId].workableAndAssigned.teamTotals[team].totalRemainingHours,
                          ),
                          hoursAvailable => [
                            h(
                              "td",
                              sprintId + "-" + team,
                              [hoursAvailable !== undefined && Math.floor(hoursAvailable) > 0 && "invalid"],
                              { colSpan: length },
                              [Math.floor(hoursAvailable || 0)],
                            ),
                          ],
                        ),
                      ]),
                    ],
                  ),
                ]),
              ]),
            ]),
            h("tbody", "body", [
              ...LoopOver(data.epics, (epic, epicId) => [
                ...If(epic.order === undefined || includedTeams.some(t => epic.order!.indexOf(t) > -1), () => [
                  ...LoopOver(
                    data.budgetAssignments[epicId] || { "": { perSprint: { "": { "": { "type": "solveable" } } } } },
                    (assignment, deliverableId, idx, all) => [
                      ...With(getProject(deliverableId, data.projects), ([projId, proj]) => [
                        h("tr", epicId + "-" + deliverableId, [
                          ...If(idx === 0, () => [
                            h(
                              "th",
                              "orderCell",
                              {
                                rowSpan: countItems(all),
                                onDoubleClick: mutators.setEpicOrder(epicId, epic.order)
                              },
                              [epic.order],
                            ),
                            h(
                              EpicCell,
                              "epic",
                              {
                                rowSpan: countItems(all),
                                epicId,
                                epic,
                                mutators,
                              },
                              [],
                            ),
                          ]),
                          h(
                            "th",
                            "deliverable",
                            [proj === undefined && "invalid", "deliverableLabel"],
                            {
                              style: { textAlign: "right" },
                            },
                            [
                              h(
                                "span",
                                "projectLabel",
                                ["projectLabel"],
                                {
                                  onDoubleClick: mutators.removeDeliverable(epicId, deliverableId),
                                  title:
                                    proj === undefined
                                      ? "There is no project that contains this deliverable!"
                                      : proj.label,
                                },
                                [proj === undefined ? "UNKNOWN" : proj.shortHand, ": "],
                              ),
                              sd(sd => sd.deliverables[deliverableId].label),
                            ],
                          ),
                          h(
                            "th",
                            "assignment",
                            ["deliverableTotal"],
                            {
                              style: { textAlign: "right" },
                              onDoubleClick: mutators.setMaxAssignment(epicId, deliverableId),
                            },
                            [
                              sd(sd => sd.summaries.perEpic[epicId].perDeliverable[deliverableId].totalPlanned, "0"),
                              sd(sd => sd.budgetAssignments[epicId][deliverableId].max, m => " / " + m, ""),
                            ],
                          ),
                          ...LoopOver(
                            sprints,
                            ({ sprintId, year, firstWeek, lastWeek, length }) => [
                              ...LoopOver(includedTeams, team => [
                                ...If(
                                  isInPast(year, lastWeek, today),
                                  () => [
                                    h(
                                      "td",
                                      "data-" + sprintId + "-" + team,
                                      ["unavailable"],
                                      {
                                        colSpan: length,
                                      },
                                      [],
                                    ),
                                  ],
                                  () => [
                                    ...With(
                                      isAvailable(
                                        year,
                                        firstWeek,
                                        lastWeek,
                                        deliverableId,
                                        data.deliverables[deliverableId],
                                        proj,
                                      ),
                                      available => [
                                        h(
                                          "td",
                                          "data-" + sprintId + "-" + team,
                                          [
                                            available ? "" : "unavailable",
                                            sd<SolverSetting, "hardcoded" | null, null>(
                                              sd => sd.budgetAssignments[epicId][deliverableId].perSprint[sprintId][team],
                                              v => (v.type === "hardcoded" ? "hardcoded" : null),
                                              null,
                                            ),
                                          ],
                                          {
                                            colSpan: 2,
                                            onClick: available
                                              ? doubleClickStateMachine(
                                                  mutators.setSprintEnabled(epicId, deliverableId, sprintId, team),
                                                  mutators.overrideSprintValue(epicId, deliverableId, sprintId, team),
                                                )
                                              : () => {},
                                            // available ? mutators.setSprintEnabled(epicId, deliverableId, sprintid, team) : () => {},
                                          },
                                          [sd(sd => sd.solverResult.solvedValues[epicId][deliverableId][sprintId][team])],
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ]),
                            ],
                          ),
                        ]),
                      ]),
                    ],
                  )
                ]),
              ]),
              h("tr", "addEpicRow", [
                h(
                  "th",                                     
                  "addEpic",
                  {
                    style: { cursor: "pointer" },
                    onClick: mutators.addEpic(),
                  },
                  ["Add..."],
                ),
              ]),
              ...LoopOver(data.summaries.projectsWithHoursDirectlyAssigned, (teams, projId) => [
                ...If(includedTeams.some(t => teams[t]), () => [
                  ...With(data.projects[projId]!, (project) => [
                    h("tr", "leftover-pro" + projId, [
                      h("td", "label", {colSpan: 4}, [project.label]),
                      ...LoopOver(sprints, ({ sprintId, year, firstWeek, lastWeek, length }) => [
                        ...LoopOver(includedTeams, team => [
                          h("td", "projAssHours-" + sprintId + "-" + team, {colSpan: length}, [sd(sd => sd.summaries.perSprint[sprintId].trackedTime[team].hoursAssignedToProjectsNotEpics[projId], v => minutesToHourFractions(v), undefined)]),
                        ])
                      ])
                    ])
                  ])
                ])
              ])
            ]),
          ]),
        ],
      ),
    ],
  );
};

function isAvailable(
  year: number,
  startWeek: number,
  endWeek: number,
  deliverableKey: string,
  deliverable: Deliverable | undefined,
  project: Project | undefined,
): boolean {
  if (deliverable === undefined) {
    return false;
  } else {
    const deliverableStart = getDeliverableOrProjectDate(deliverableKey, deliverable, "availableFrom", project);
    const firstSprintDay = getMonday(year, startWeek);
    const lastSprintDay = getMonday(year, endWeek);
    if (deliverableStart !== undefined) {
      if (firstSprintDay.getTime() < deliverableStart.getTime()) {
        return false;
      }
    }
    const deliverableEnd = getDeliverableOrProjectDate(deliverableKey, deliverable, "availableUntil", project);
    if (deliverableEnd !== undefined) {
      if (lastSprintDay.getTime() > deliverableEnd.getTime()) {
        return false;
      }
    }
    return true;
  }
}

function getDeliverableOrProjectDate(
  deliverableKey: string,
  deliverable: Deliverable,
  prop: "availableFrom" | "availableUntil",
  proj: Project | undefined,
): Date | undefined {
  const dVal = deliverable[prop];
  if (dVal === undefined) {
    if (proj !== undefined) {
      if (proj.deliverables[deliverableKey]) {
        const pval = proj[prop];
        if (pval === undefined) {
          return undefined;
        } else {
          return new Date(pval);
        }
      }
    }
    return undefined;
  } else {
    return new Date(dVal);
  }
}

const EpicCell: FunctionComponent<{
  epic: EpicMetadata;
  mutators: Mutators;
  epicId: string;
  rowSpan: number;
}> = function({ epic, mutators, epicId, rowSpan }) {
  return h(
    "th",
    epicId,
    ["epicLabel"],
    {
      style: { textAlign: "right" },
      rowSpan,
      onDoubleClick: mutators.editEpicTitle(epicId),
      onDragOver: e => {
        // if(e.target.nodeType == 1) {
        // e.target.preventDefault()
        e.preventDefault();
        e.stopPropagation();
        // }
      },
      onDrop: e => {
        e.preventDefault();
        const delid = e.dataTransfer.getData("text");
        mutators.addEpicDeliverable(epicId, delid)();
      },
    },
    [epic.label],
  );
};

function doubleClickStateMachine(onClick: () => void, onDoubleClick: () => void): () => void {
  let timout: undefined | number = undefined;
  return function() {
    if (timout === undefined) {
      timout = window.setTimeout(() => {
        timout = undefined;
        onClick();
      }, 200);
    } else {
      window.clearTimeout(timout);
      onDoubleClick();
      timout = undefined;
    }
  };
}
