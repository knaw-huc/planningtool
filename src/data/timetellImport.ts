import { parseTSV } from "./parseTSV";
import { Projects, Project } from "../model/datamodel";
import { explicitError } from "../tools/explicitError";
import { zeroPad } from "../tools/zeroPad";
import fs from 'fs'

function findProj(data: Projects, label: string): string | undefined {
  for (const id in data) {
    if (data[id]!.label.toLowerCase() === label.toLowerCase()) {
      return id;
    }
  }
  return undefined;
}

export const timetellImport = function(projects: Projects, data: string) {
  const unknowProjects: {[key:string]: string} = {}
  const projectDefs: {[key:string]: Project} = {}
  const result = parseTSV(
    {
      Datum: (s, line) => {
        if (s !== undefined) {
          return s.split("-").reverse().join("-")
        } else {
          explicitError("A timetell entry without a date was found!")
          return "1900-01-01"
        }
      },
      Medewerker: (_s, line) => {
        const s = line.Medewerker_naam
        if (s !== undefined) {
          return s;
        } else {
          explicitError("A timetell entry without an employee nr was found!")
          return ""
        }
      },
      Project: (s, line) => {
        const projNaam = line.Project_naam === undefined ? line.Activiteit_naam! : line.Project_naam
        const proj = findProj(projects, projNaam)
        if (proj === undefined) {
          if (unknowProjects[projNaam] === undefined) {
            const id = "NEW-" + zeroPad(Object.keys(unknowProjects).length + 1)
            unknowProjects[projNaam] = id
            projectDefs[id] = {
              deliverables: {},
              done: false,
              group: "_NEW",
              hoursAvailable: 0,
              label: projNaam,
              shortHand: id
            }
            if (line.Code) {
              if (projectDefs[id].projectnr && projectDefs[id].projectnr !== line.Code) {
                  console.error("Two projects with the same name and a different number: " + line.Code + ", " + projectDefs[id].projectnr)
              }
              if (!projectDefs[id].projectnr) {
                projectDefs[id].projectnr = line.Code
              }
            }
          }
          return {
            label: projNaam!,
            proj: unknowProjects[projNaam]
          }
        } else {
          if (line.Code) {
            if (projects[proj]!.projectnr && projects[proj]!.projectnr !== line.Code) {
              console.error("Two projects with the same name and a different number: " + line.Code + ", " + projects[proj]!.projectnr)
            }
            if (!projects[proj]!.projectnr) {
              console.log(`Project: ${proj} has nr ${line.Code}`)
            }
          }
          return {
            label: projNaam!,
            proj
          }  
        }
      },
      Uren_text: (s, line) => line.Uren,
      Minuten: (s, line) =>
        {
          if (line.Uren !== undefined) {
            return Math.round((+((line.Uren)!.replace(",", "."))) * 60);
          } else {
            return 0;
          }
        }
    },
    data
  );
  return {
    projects: projectDefs,
    timetellImport: result
  };
};


const result = timetellImport(
  JSON.parse(fs.readFileSync("../../../data.json", "utf-8")), 
  fs.readFileSync("./timetell.csv", "utf-8")
)
console.log(result)