import * as vscode from "vscode";
import { ProfileManager } from "../services/profileManager";
import { GitService } from "../services/gitService";
import { getActiveWorkspacePath } from "../utils/workspace";

let statusBarItem: vscode.StatusBarItem;

export function initStatusBar(
  context: vscode.ExtensionContext
): vscode.StatusBarItem {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = "gitid.switchProfile";
  statusBarItem.text = "GitID: Detecting...";
  statusBarItem.tooltip = "Click to manage or switch Git profiles";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
  return statusBarItem;
}

export async function updateStatusBar(pm: ProfileManager) {
  if (!statusBarItem) {
    return;
  }
  const cwd = getActiveWorkspacePath();
  statusBarItem.text = "GitID: Checking...";

  try {
    const activeConfig = await GitService.getCurrentConfig(cwd);
    const activeEmail = activeConfig.email;

    if (!activeEmail) {
      statusBarItem.text = "$(alert) GitID: Unknown";
      statusBarItem.tooltip =
        "No active user.email detected.\nClick to configure or apply a profile.";
      return;
    }

    const scope = await GitService.getActiveScope(cwd);
    const profile = pm.getProfileByEmail(activeEmail);
    const alias = profile ? profile.alias : "Unregistered";

    statusBarItem.text = `GitID: ${alias}`;
    statusBarItem.tooltip = `Active GitID: ${alias}\nName: ${activeConfig.name || "(not set)"}\nEmail: ${activeConfig.email}\nSigning: ${activeConfig.gpgSign ? "Enabled" : "Disabled"}\nKey: ${activeConfig.signingKey || "None"}\nScope: ${scope}`;
  } catch {
    statusBarItem.text = "$(alert) GitID: Unknown";
    statusBarItem.tooltip = "Failed to retrieve active git configuration.";
  }
}
