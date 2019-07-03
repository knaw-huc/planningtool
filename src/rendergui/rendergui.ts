import { Data, Project, Deliverable } from "../model/datamodel";
import { LoopOver, If } from "../tools/ArrayExpressions";
import { Gettable } from "../tools/getset";
import { h } from "../react-hyperscript/index";
import { Mutators } from "../mutators";
import { FunctionComponent } from "react";
import ReactDOM from "react-dom";
import { renderCapacityPlanning } from "./renderCapacityPlanning";
import { getWeekYear, getWeek } from "../model/date-calc";
import { renderProjectTable } from "./renderProjectTable";

// TODO: login
// TODO: Correct calendars for everyone
// TODO: Add holiday planning
// TODO: Add per sprint planning that allows planning per person and setting sprint goals
// TODO: Add time tracking

// TODO: Save data to google sheets
// TODO: add scenario's
function validInput(input: { validity?: { valid: boolean } }) {
  return input && (!input.validity || input.validity.valid);
}

function prefillOrValue(assigned: number | undefined, calculated: number | undefined) {
  if (assigned !== undefined) {
    return {
      value: assigned,
    };
  } else {
    if (calculated !== undefined) {
      return {
        placeholder: calculated,
        value: "",
      };
    } else {
      return {
        value: "",
      };
    }
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
        const pVal = proj[prop];
        if (pVal !== undefined) {
          return new Date(pVal);
        }
      }
    }
    return undefined;
  } else {
    return new Date(dVal);
  }
}

const makeTabList: FunctionComponent<{
  mutators: Mutators,
  currentTab: string | undefined,
  tabs: Array<{ caption: string; id: string; content: () => React.ReactElement }>;
}> = function makeTabList({ mutators, tabs, currentTab }) {
  const selectedTabId = currentTab === undefined ? (tabs.length > 0 ? tabs[0].id : undefined) : currentTab
  return h([
    h("div", "tabs", ["tabList"], [
      ...LoopOver(tabs, tab => [
        h("div", tab.id, ["tab", selectedTabId === tab.id && "active"], [
          h("a", "link", { href: "#", onClick: e => {
            e.preventDefault();
            mutators.setTab(tab.id)()
          } }, [tab.caption]),
        ]),
      ]),
    ]),
    h("div", "tabContent", ["tabContent"], [
      ...LoopOver(tabs, (tab, i) => [...If(selectedTabId === tab.id, () => [tab.content()])]),
    ]),
  ]);
};

const renderTimeTrack: FunctionComponent<{
  currentUser: string;
  currentSprint: string;
  mutators: Mutators;
}> = function renderTimeTrack({ currentUser, currentSprint, mutators }) {
  return h([]);
  //   // let epicsAndProjects = safeGet(data.realisatie, [currentSprint.id, currentUser, "bookings"], v => Object.keys(v).reduce((o,k) => o[k] = {}, {}), () => ({}));
  //   // //Add all Epics from the teams where the user is a member
  //   // //And all Epics where the user has specific hours assigned
  //   // const teams = Object.keys(data.teams).filter(teamId => data.teams[teamId].defaultMembers.indexOf(currentUser) > 0);
  //   // if (data.planning.hasOwnProperty(currentSprint.id)) {
  //   //   for (const teamId in data.planning[currentSprint.id]) {
  //   //     const isTeamMember = teams.indexOf(teamId) > -1
  //   //     for (const epicId in data.planning[currentSprint.id][teamId]) {
  //   //       // if () {

  //   //       // } else if (isTeamMember) {
  //   //       //   if (!epicsAndProjects["EPIC: " + epicId]) {
  //   //       //     epicsAndProjects["EPIC: " + epicId] = {

  //   //       //     }
  //   //       //   }
  //   //       //   epicsAndProjects.add()
  //   //       // }
  //   //     }
  //   //   }
  //   // }
  //   return [
  //     h("table", {border: 1}, [
  //       h("thead", [
  //         h("tr", [
  //           h("th", {colSpan: 3}, ["Date"]),
  //           ...LoopOver(getDays(currentSprint), (day) => [
  //             h("th", [
  //               ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day.getDay()] + " " + format(day).split("-").slice(1).reverse().join("-")
  //             ]),
  //           ]),
  //         ]),
  //         h("tr", [
  //           h("th", {colSpan: 3}, ["calendar hours / total"]),
  //           ...LoopOver(getWorkHours(currentUser, currentSprint), ({day, workhours}) => [
  //             h("th", [
  //               gett(data.realisatie, r => r[currentSprint.id][currentUser].totalsPerDay[format(day)], v => formatTime(v) + " / "),
  //               h("input", {
  //                 style: {width: "6em"},
  //                 min: 0,
  //                 type: "time",
  //                 onChange: (e: any) => {
  //                   validInput(e.target) && setWorkDayOverride(currentUser, day, e.target.value)
  //                 },
  //                 size: 2,
  //                 value: formatTime(workhours)
  //               }, [])
  //             ])
  //           ]),
  //         ]),
  //         h("tr", [
  //           h("th", ["Epic or Project"]),
  //           h("th", ["Task description"]),
  //           h("th", ["total"]),
  //         ]),
  //       ]),
  //       h("tbody", [
  //         ...LoopOver(gett(data.realisatie, r => r[currentSprint.id][currentUser].bookings) || {}, (data, epicOrProjectId) => [
  //           ...LoopOver(data, (task, taskId, idx) => [
  //             h("tr", [
  //               ...If(idx === 0, () => [
  //                 h("th", {rowSpan: Object.keys(data).length}, [epicOrProjectId]),
  //               ]),
  //               h("th", [taskId]),
  //               h("th", [formatTime(task.total)]),
  //               ...LoopOver(getDays(currentSprint), (day) => [
  //                 h("th", [
  //                   h("input", {
  //                     type:"time",
  //                     onChange: (e: any) => trackHours(currentSprint.id, currentUser, day, epicOrProjectId, taskId, e.target.value),
  //                     value: gett(task, t => t.perDay[format(day)], v => formatTime(v))}, [])
  //                 ]),
  //               ]),
  //             ]),
  //           ]),
  //         ]),
  //       ]),
  //     ]),
  //   ]
};

function generate(
  firstSprint: string,
  lastSprint: string,
  includedTeams: string[],
  currentUser: string,
  currentSprint: string,
  data: Data,
  sd: Gettable<Data>,
  mutators: Mutators,
) {
  return h([
    h("div", "connectionMessage", ["connectionMessage", data.viewData.isConnected ? "connected" : "disconnected"], [`We have ${data.viewData.isConnected ? "a" : "no"} connection to the server`]),
    h(
    makeTabList,
    "tabList",
    {
      mutators: mutators,
      currentTab: data.viewData.currentTab,
      tabs: [
        {
          id: "OverallPlanning",
          caption: "Overall planning",
          content: () =>
            h(
              renderCapacityPlanning,
              "renderCapacityPlanning",
              {
                curYear: new Date().getFullYear(),
                data,
                sd,
                mutators,
                includedTeams,
              },
              [],
            ),
        },
        // {
        //   id: "HourTracking",
        //   caption: "HourTracking",
        //   content: () => h(renderTimeTrack, { currentUser, currentSprint, mutators }, []),
        // },
        {
          id: "ProjectList",
          caption: "Project details",
          content: () => h(renderProjectTable, "renderProjectTable", { data, sd, mutators }, []),
        },
      ],
    },
    [],
  )])
}

export function update(dataStruct: undefined | {data: Data, safeData: Gettable<Data>, mutators: Mutators}) {
  const reactTree = dataStruct === undefined ? h("div", "main", ["connectionMessage", "disconnected"], ["Connecting..."]) : generate(
    dataStruct.data.viewData.startSprint,
    dataStruct.data.viewData.endSprint,
    Object.keys(dataStruct.data.viewData.includedTeams).filter(teamId => dataStruct.data.viewData.includedTeams[teamId]),
    "Mario",
    dataStruct.data.sprintPlanning[getWeekYear(new Date())][getWeek(new Date())],
    dataStruct.data,
    dataStruct.safeData,
    dataStruct.mutators,
  );
  ReactDOM.render(reactTree, document.getElementById("planning"));
}
