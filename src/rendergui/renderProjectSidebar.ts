import { Data, Project, Deliverable } from "../model/datamodel";
import { LoopOver, With, If } from "../tools/ArrayExpressions";
import { ifPresentOrElse } from "../tools/data-access";
import { Gettable } from "../tools/getset";
import { h } from "../react-hyperscript/index";
import { Mutators } from "../mutators";
import { FunctionComponent } from "react";
import { explicitError } from "../tools/explicitError";

export const renderProjectSidebar: FunctionComponent<{
  data: Data;
  sd: Gettable<Data>;
  mutators: Mutators;
}> = function renderProjectSidebar({ data, sd, mutators }) {
  return h("div", "projectSideBar", [
    ...LoopOver(data.summaries.groupedProjects, (group, groupId) => [
      h("h1", groupId, [groupId]),
      ...LoopOver(group.projects, (project, projId, idx) => [
        ...With(sd(sd => sd.summaries.perProject[projId].budgetRemaining), budgetRemaining => [
          ...If(!projectIsUnUsable(project, budgetRemaining), () => [
            h("div", groupId + "-" + projId, ["projBox", (budgetRemaining === undefined || budgetRemaining > 5 || budgetRemaining < -5) ? "toPlan" : false], [
              h("div", "projTitle", [
                h("span", "title", ["title"], {
                  title: `${project.shortHand}`,
                  onDoubleClick: mutators.setProjectProp(projId, "label", project.label),
                }, [project.label, h("span", "shortHand", ["projectLabel"], [project.shortHand])]),
                h("span", "hoursAvailable", {
                  title: formatBudgetExplanation(project.hoursAvailable, sd(sd => sd.summaries.perProject[projId].sumTimeTell), sd(sd => sd.summaries.perProject[projId].totalPlanned), budgetRemaining, projId),
                  style: {
                    float: "right",
                  },
                  onDoubleClick: mutators.setProjectProp(projId, "hoursAvailable", project.hoursAvailable),
                }, [
                    "\t",
                    h("span", "budgetRemaining", [budgetRemaining]),
                    budgetRemaining !== undefined ? " / " : "",
                    h("span", "hoursAvailable", [project.hoursAvailable]),
                  ]),
              ]),
              h("div", "daterange", ["daterange"], { title: `Project is available from ${project.availableFrom} until ${project.availableUntil}` }, [formatStartEndDate(project.availableFrom, project.availableUntil)]),
              h("ul", "deliverables", ["deliverables"], [
                ...LoopOver(project.deliverables, (_deliverable, delid, idx) => [
                  ifPresentOrElse(data.deliverables[delid], deliverable => h(DeliverableComponent, delid, { deliverable, delid, projId, mutators, sd }, []), () => explicitError(`Deliverable ${delid} is not defined`)),
                ]),
                h("div", "addButton", ["addbtn"], { style: { textDecoration: "underline", cursor: "pointer" }, onClick: mutators.addDeliverable(projId) }, ["Add..."])
              ]),
            ]),
          ]),
        ]),
      ]),
    ]),
  ]);
};


function projectIsUnUsable(project: Project, budgetRemaining: number | undefined) {
  return (project.movedTo !== undefined || project.done) && (budgetRemaining === undefined ? project.hoursAvailable <= 0 : budgetRemaining <= 0);
}

const DeliverableComponent: FunctionComponent<{
  deliverable: Deliverable;
  projId: string;
  delid: string;
  mutators: Mutators;
  sd: Gettable<Data>;
}> = function({ deliverable, delid, mutators, projId, sd }) {
  return h(
    "li",
    "deliverableItem",
    ["checkbox", deliverable.done && "done"],
    [
      h(
        "input",
        "checkbox",
        {
          type: "checkbox",
          checked: deliverable.done,
          onChange: mutators.setDeliverableProp(projId, delid, "done", deliverable.done),
        },
        [],
      ),
      h(
        "span",
        "label",
        {
          style: {
            cursor: "grab",
          },
          onDoubleClick: mutators.setDeliverableProp(projId, delid, "label", deliverable.label),
          onDragStart: e => {
            // e.dataTransfer.effectAllowed = "link"
            e.dataTransfer.setData("text", delid);
          },
          draggable: true,
        },
        [
          deliverable.label,
          h("span", "value", {style:{float: "right"}}, [
            sd(sd => sd.summaries.perDeliverable[delid].totalPlanned)
          ])
        ],
      ),
      ...LoopOver(sd(sd => sd.summaries.perDeliverable[delid].assignedTeams), (_true, id) => [
        h("span", "teamlabel" + id, ["teamLabel"], [id]),
      ]),
    ],
  );
};

function formatBudgetExplanation(
  hoursBudget: number,
  sumTimeTell: number | undefined,
  budgetPlanned: number | undefined,
  budgetRemaining: number | undefined,
  projId: string,
): string {
  let result = `There are ${hoursBudget} hours assigned to this project. `;
  if (sumTimeTell === undefined) {
    result += "No hours have been logged yet. ";
  } else {
    result += `${sumTimeTell} hours have been logged. `;
  }
  if (budgetPlanned === undefined || budgetPlanned === 0) {
    result += "No work is planned for the future. ";
  } else {
    result += `${budgetPlanned} hours are planned for the future. `;
  }
  if (budgetRemaining !== undefined) {
    if (budgetRemaining === 0) {
      result += `So there are no more hours available.`;
    } else if (budgetRemaining < 0) {
      result += `So we're ${budgetRemaining * -1} hours over budget.`;
    } else {
      result += `So we have ${budgetRemaining} hours remaining.`;
    }
  }
  return result;
}



function isLastDay(year: number, month: number, day: number) {
  if (month === 2 && day === 28) {
      const isleapyear = (year % 4 === 0) && (year % 100 !== 0 || year % 400 === 0)
      return !isleapyear
  } else {
    return [null, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month] === day
  }
}

function monthName(month: number) {
  return ["offset", "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"][month]
}

function shrinkdate(date: string | undefined, isStart: boolean, allowYear: boolean): [string, boolean] {
  let result
  let isyearlevel;
  if (date == null || date == "") {
    return ["?", false];
  }
  const [year, month, day] = date.split("-").map(x => +x)
  if (year === 0 || isNaN(year) || month === 0 || isNaN(month) || day === 0 || isNaN(day)) {
    return ["?", false]
  }
  if (isStart) {
    if (day === 1) {
      if (month === 1 && allowYear) {
        return [year + "", true]
      } else {
        return [monthName(month) + " " + year, false]
      }
    } else {
      return [day + " " + monthName(month) + " " + year, false]
    }
  } else {
    if (isLastDay(year, month, day)) {
      if (month === 12 && allowYear) {
        return [year + "", true]
      } else {
        return [monthName(month) + " " + year, false]
      }
    } else if (day === 1) { //we often end a project on the first day of the next month
      if (month === 1 && allowYear) {
        return [(year - 1) + "", true]
      } else {
        return [monthName(month - 1) + " " + year, false]
      }
    } else {
      return [day + " " + monthName(month) + " " + year, false]
    }
  }
}

function formatStartEndDate(startDate: string | undefined, endDate: string | undefined) {
  const [formattedend, isYear] = shrinkdate(endDate, false, true)
  const [formattedStart] = shrinkdate(startDate, true, isYear)

  
  if (formattedend === formattedStart) {
    return formattedStart;
  } else {
    return formattedStart + " - " + formattedend;
  }
}