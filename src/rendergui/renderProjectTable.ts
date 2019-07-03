import { Data, Project } from "../model/datamodel";
import { LoopOver, With } from "../tools/ArrayExpressions";
import { ifPresentOrElse } from "../tools/data-access";
import { Gettable } from "../tools/getset";
import { h } from "../react-hyperscript/index";
import { Mutators } from "../mutators";
import { FunctionComponent } from "react";
import { explicitError } from "../tools/explicitError";
import { countItems } from "./countItems";

export const renderProjectTable: FunctionComponent<{
  data: Data;
  sd: Gettable<Data>;
  mutators: Mutators;
}> = function renderProjectTable({ data, sd, mutators }) {
  return h("div", "projectTable", ["scrollContainer"], [
    h("table", "mainTable", { style: { tableLayout: "fixed", width: "33rem" } }, [
      h("thead", "heading", [
        h("tr", "labels", {style: { position: "sticky", top: 0, backgroundColor: "white"}}, [
          h("th", "Groep", { style: { width: "10rem" } }, ["Groep"]),
          h("th", "nr.", { style: { width: "8rem" } }, ["nr."]),
          h("th", "lead.", { style: { width: "8rem" } }, ["Project lead"]),
          h("th", "Shorth.", { style: { width: "9rem" } }, ["Shorth."]),
          h("th", "Label", { style: { width: "26rem" } }, ["Label"]),
          h("th", "Moved to", { style: { width: "6rem" } }, ["Move to"]),
          h("th", "Bud.", { style: { width: "3rem" } }, ["Bud."]),
          h("th", "TT.", { style: { width: "3rem" } }, ["TT."]),
          h("th", "Valid From", { style: { width: "6rem" } }, ["Valid From"]),
          h("th", "Valid Until", { style: { width: "6rem" } }, ["Valid Until"]),
          h("th", "checkbox", { style: { width: "1rem" } }, ["✅"]),
          h("th", "remarks.", { style: { width: "8rem" } }, ["Remarks"]),
        ]),
      ]),
      h("tbody", "body", [
        ...LoopOver(data.summaries.groupedProjects, (group, groupId) => [
          ...LoopOver(group.projects, (project, projId, idx) => [
            ...With(sd(sd => sd.summaries.perProject[projId].budgetRemaining, 0), budg => [
              h("tr", "projectline-" + projId, [ ((project.remarks !== undefined && project.remarks.length > 0) || budg < 0 || (budg > 0 && project.availableUntil !== undefined && new Date(project.availableUntil).getTime() < new Date().getTime())) && "toPlan"], [
                h("td", "groupId", {
                  onDoubleClick: mutators.setProjectProp(projId, "group", project.group),
                  style: { textAlign: "left" },
                }, [groupId]),
                h("td", "projectnr", {
                  onDoubleClick: mutators.setProjectProp(projId, "projectnr", project.projectnr),
                }, [project.projectnr]),
                h("td", "projectlead", {
                  onDoubleClick: mutators.setProjectProp(projId, "projectLead", project.projectLead),
                }, [project.projectLead]),
                h("td", "shortHand", {
                  onDoubleClick: mutators.setProjectProp(projId, "shortHand", project.shortHand),
                }, [project.shortHand]),
                h("td", "label", {
                  onDoubleClick: mutators.setProjectProp(projId, "label", project.label),
                }, [project.label]),
                h("td", "Move to", {
                  onDoubleClick: mutators.setProjectProp(projId, "movedTo", project.movedTo),
                }, [project.movedTo]),
                h("td", "hoursAvailable", {
                  onDoubleClick: mutators.setProjectProp(projId, "hoursAvailable", project.hoursAvailable),
                }, [project.hoursAvailable + ""]),
                h("td", "sumTimetell", [sd(sd => sd.summaries.perProject[projId].sumTimeTell, x => Math.ceil(x), null)]),
                h("td", "availableFrom", {
                  onDoubleClick: mutators.setProjectProp(projId, "availableFrom", project.availableFrom),
                }, [project.availableFrom]),
                h("td", "availableUntil", {
                  onDoubleClick: mutators.setProjectProp(projId, "availableUntil", project.availableUntil),
                }, [project.availableUntil]),
                h("td", "done", [h("input", "cb", {type: "checkbox", checked: project.done, onChange: mutators.setProjectProp(projId, "done", project.done) }, [])]),
                h("td", "remarks", {
                  onDoubleClick: mutators.setProjectProp(projId, "remarks", project.remarks),
                }, [project.remarks]),
              ])
            ]),
          ]),
        ]),
        h("tr", "addRow", [
          h("td", "add", {
            onClick: mutators.addProject(),
            style: { textAlign: "left", cursor: "pointer" },
          }, ["Add..."]),  
        ])
      ]),
    ])
  ]);
};
