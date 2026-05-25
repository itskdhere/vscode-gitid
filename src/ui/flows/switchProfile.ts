import * as vscode from "vscode";
import { ProfileManager } from "../../services/profileManager";
import { GitService } from "../../services/gitService";
import { getActiveWorkspacePath } from "../../utils/workspace";
import { createProfileFlow } from "./createProfile";
import { applyProfileFlow } from "./applyProfile";
import { manageProfilesFlow } from "./manageProfiles";

export async function switchProfileFlow(pm: ProfileManager): Promise<void> {
  const cwd = getActiveWorkspacePath();

  const activeEmail = await GitService.getActiveEmail(cwd);
  const scope = await GitService.getActiveScope(cwd);
  const profiles = pm.getProfiles();
  const items: vscode.QuickPickItem[] = [];

  profiles.forEach((profile) => {
    const isActive =
      activeEmail &&
      activeEmail.toLowerCase().trim() === profile.email.toLowerCase().trim();
    items.push({
      label: `${isActive ? "$(check) " : ""}GitID: ${profile.alias}`,
      description: `|  ${profile.name} <${profile.email}>`,
      detail: `${profile.gpgSign ? "Signing: Enabled" : "Signing: Disabled"}${profile.signingKey ? `  |  Key: ${profile.signingKey}` : ""}${isActive ? `  |  Scope: ${scope}` : ""}`,
      profile: profile,
    } as any);
  });

  if (items.length > 0) {
    items.push({ label: "", kind: vscode.QuickPickItemKind.Separator });
  }

  items.push({
    label: "$(add) Create New Profile...",
    description: "Register a new Git identity profile",
  });

  if (profiles.length > 0) {
    items.push({
      label: "$(gear) Manage Profiles...",
      description: "Edit, update, or remove existing profiles",
    });
  }

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: "Select a Git profile to apply, or choose an action",
  });

  if (!selected) {
    return;
  }

  if (selected.label === "$(add) Create New Profile...") {
    const newProfile = await createProfileFlow(pm);
    if (newProfile) {
      const applySelect = await vscode.window.showQuickPick(
        ["Apply Now", "Just Save"],
        { placeHolder: `Apply profile "${newProfile.alias}" immediately?` }
      );
      if (applySelect === "Apply Now") {
        await applyProfileFlow(newProfile);
      }
    }
    return;
  }

  if (selected.label === "$(gear) Manage Profiles...") {
    await manageProfilesFlow(pm);
    return;
  }

  const selectedProfile = (selected as any).profile;

  if (selectedProfile) {
    await applyProfileFlow(selectedProfile);
  }
}
