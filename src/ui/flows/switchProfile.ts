import * as path from "path";
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

  const checkGreenUri = vscode.Uri.file(
    path.join(__dirname, "..", "assets", "check-green.svg")
  );

  profiles.forEach((profile) => {
    const isActive =
      activeEmail &&
      activeEmail.toLowerCase().trim() === profile.email.toLowerCase().trim();
    items.push({
      label: `GitID: ${profile.alias}`,
      description: `|  ${profile.name} <${profile.email}>`,
      detail: `${profile.gpgSign ? "Signing: Enabled" : "Signing: Disabled"}${profile.signingKey ? `  |  Key: ${profile.signingKey}` : ""}${isActive ? `  |  Scope: ${scope}` : ""}`,
      iconPath: isActive
        ? checkGreenUri
        : new vscode.ThemeIcon("circle-outline"),
      profile: profile,
    } as any);
  });

  if (items.length > 0) {
    items.push({ label: "", kind: vscode.QuickPickItemKind.Separator });
  }

  if (cwd && scope === "Local") {
    items.push({
      label: "Use Global Profile",
      description:
        "Unset local workspace identity configurations to inherit global settings",
      iconPath: new vscode.ThemeIcon("globe"),
    } as any);
  }

  items.push({
    label: "Create New Profile...",
    description: "Register a new Git identity profile",
    iconPath: new vscode.ThemeIcon("add"),
  } as any);

  if (profiles.length > 0) {
    items.push({
      label: "Manage Profiles...",
      description: "Edit, update, or remove existing profiles",
      iconPath: new vscode.ThemeIcon("gear"),
    } as any);
  }

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: "Select a Git profile to apply, or choose an action",
  });

  if (!selected) {
    return;
  }

  if (selected.label === "Use Global Profile") {
    try {
      await GitService.unsetLocalConfig(cwd!);
      vscode.window.showInformationMessage(
        "GitID: Cleared local repository identity. Now inheriting global settings!"
      );
    } catch (err: any) {
      vscode.window.showErrorMessage(
        `GitID: Failed to clear local configuration. ${err.stderr || err.stdout || err.message || err}`
      );
    }
    return;
  }

  if (selected.label === "Create New Profile...") {
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

  if (selected.label === "Manage Profiles...") {
    await manageProfilesFlow(pm);
    return;
  }

  const selectedProfile = (selected as any).profile;

  if (selectedProfile) {
    await applyProfileFlow(selectedProfile);
  }
}
