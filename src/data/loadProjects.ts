import { Projects, Deliverables } from "../model/datamodel";
import { format } from "../model/date-calc";
import { importedXlReporting } from "./importedXlReporting";
import { importedProjects } from "./importedProjects";
import { deliverablesImport } from "./deliverablesImport";
import { explicitError } from "../tools/explicitError";

function addIfPresent<T extends string, U>(key: T, value: U | undefined): {[key in T]?: U} {
  const result: {[key in T]?: U} = {}
  if (value !== undefined) {
    result[key] = value;
  }
  return result;
}

export function loadProjects(): {projects: Projects, deliverables: Deliverables} {
  const projects: Projects = {};
  const deliverables: Deliverables = {};
  const afkColumnInXlReporting = "f7";
  const startDateColumnInXlReporting = "f3";
  const endDateColumnInXlReporting = "f4";
  for (const line of importedProjects) {
    if (line.AFK) {
      const proj = projects[line.AFK];
      if (proj) {
        if (Object.keys(proj.deliverables).length === 0) {
          // proj.deliverables[proj.shortHand + "-D00"] = {
          //   availableFrom: "",
          //   availableUntil: "",
          //   description: "",
          //   done: false,
          //   hoursBudget: proj.hoursAvailable,
          //   label: proj.label
          // }
        }
        if (line.Project) {
          for (let i = 0; i < proj.label.length; i++) {
            if (line.Project[i] !== proj.label[i]) {
              proj.label = proj.label.substr(0, i - 1);
              break;
            }
          }
        }
        // proj.deliverables[proj.shortHand + "-D" + zeroPad(Object.keys(proj.deliverables).length + 1)] = {
        //   availableFrom: "",
        //   availableUntil: "",
        //   description: "",
        //   done: false,
        //   hoursBudget: (+(line["2019 UREN"] || "0")),
        //   label: line.Project || line.AFK,
        // }
        proj.hoursAvailable += (+(line["2019 UREN"] || "0"));
      }
      else {
        const xmlReportingData = importedXlReporting.data.find(d => d[afkColumnInXlReporting] === line.AFK);
        projects[line.AFK] = {
          ...addIfPresent("availableFrom", xmlReportingData ? format(new Date(xmlReportingData[startDateColumnInXlReporting])) : undefined),
          ...addIfPresent("availableUntil", xmlReportingData ? format(new Date(xmlReportingData[endDateColumnInXlReporting])) : undefined),
          group: line.Groep || "",
          deliverables: {},
          hoursAvailable: (+(line["2019 UREN"] || "0")),
          label: line.Project || line.AFK,
          shortHand: line.AFK,
          projectnr: line.Code,
          done: false
        };
      }
    }
  }
  for (const line of deliverablesImport) {
    const proj = projects[line.Project || ""];
    if (!line.Project || !proj) {
      explicitError("Project not found", line.Project, line);
    }
    else {
      if (!line.Code) {
        explicitError("No Code present", line);
      }
      else {
        proj.deliverables[line.Code] = true;
        deliverables[line.Code] = {
          description: line.description || "",
          label: line.Label || line.Code,
          done: false,
          ...addIfPresent("deadline", line.deadline ? {
            date: line.deadline,
            reason: line["deadline reason"] || ""
          } : undefined),
        };
      }
    }
  }
  return {projects, deliverables};
}
