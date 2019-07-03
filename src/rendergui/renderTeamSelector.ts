import { LoopOver } from "../tools/ArrayExpressions";
import { h } from "../react-hyperscript/index";
import { Mutators } from "../mutators";
import { FunctionComponent } from "react";
export const renderTeamSelector: FunctionComponent<{
  availableTeams: string[];
  includedTeams: string[];
  key?: string;
  mutators: Mutators;
}> = function ({ availableTeams, includedTeams, mutators }) {
  return h("p", "teamSelector", [
    ...LoopOver(availableTeams, teamId => [
      h("label", teamId, [
        h("input", "input", {
          type: "checkbox",
          checked: includedTeams.indexOf(teamId) > -1,
          onChange: mutators.toggleTeam(teamId),
        }, []),
        teamId,
      ]),
    ]),
  ]);
};
