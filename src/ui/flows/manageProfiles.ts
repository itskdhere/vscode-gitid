import * as vscode from "vscode";
import { ProfileManager } from "../../services/profileManager";
import { editProfileFlow } from "./editProfile";

export async function manageProfilesFlow(pm: ProfileManager): Promise<void> {
  const actionPick = await vscode.window.showQuickPick(
    [
      { label: "$(pencil) Edit Profile...", value: "edit" },
      { label: "$(trash) Delete Profile...", value: "delete" },
      { label: "$(arrow-left) Back to Switcher", value: "back" },
    ],
    {
      placeHolder: "Choose a profile management operation",
    }
  );

  if (!actionPick || actionPick.value === "back") {
    return;
  }

  const profiles = pm.getProfiles();
  if (profiles.length === 0) {
    vscode.window.showInformationMessage("No profiles configured yet.");
    return;
  }

  const profilePickItems = profiles.map((p) => ({
    label: p.alias,
    description: `${p.name} <${p.email}>`,
    profile: p,
  }));

  const selected = await vscode.window.showQuickPick(profilePickItems, {
    placeHolder: `Select a profile to ${actionPick.value}`,
  });

  if (!selected) {
    return;
  }

  const target = selected.profile;

  if (actionPick.value === "delete") {
    const confirm = await vscode.window.showQuickPick(["No", "Yes"], {
      placeHolder: `Confirm deletion of profile "${target.alias}"?`,
    });
    if (confirm === "Yes") {
      await pm.deleteProfile(target.id);
      vscode.window.showInformationMessage(
        `GitID: Deleted profile "${target.alias}".`
      );
    }
  } else if (actionPick.value === "edit") {
    await editProfileFlow(pm, target);
  }
}
