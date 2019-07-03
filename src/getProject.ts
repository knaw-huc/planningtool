import { Projects } from "./model/datamodel";
export function getProject(deliverableId: string, projects: Projects) {
  for (const key in projects) {
    const proj = projects[key];
    if (proj !== undefined) {
      if (proj.deliverables[deliverableId]) {
        return [key, proj] as const;
      }
    }
  }
  return [undefined, undefined] as const;
}
