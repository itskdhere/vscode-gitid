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
    100.05
  );
  statusBarItem.command = "gitid.switchProfile";
  statusBarItem.text = "GitID: Detecting...";
  statusBarItem.tooltip = "Click to manage or switch Git profiles";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);
  return statusBarItem;
}

let lastCwd: string | undefined = undefined;
let lastResultText: string | undefined = undefined;
let lastResultTooltip: string | undefined = undefined;

export async function updateStatusBar(pm: ProfileManager, force = false) {
  if (!statusBarItem) {
    return;
  }
  const cwd = getActiveWorkspacePath();

  if (!force && cwd === lastCwd && lastResultText !== undefined) {
    statusBarItem.text = lastResultText;
    statusBarItem.tooltip = lastResultTooltip;
    return;
  }

  lastCwd = cwd;

  try {
    const activeConfig = await GitService.getCurrentConfig(cwd);
    const activeEmail = activeConfig.email;

    if (!activeEmail) {
      lastResultText = "$(alert) GitID: Unknown";
      lastResultTooltip =
        "No active user.email detected.\nClick to configure or apply a profile.";
      statusBarItem.text = lastResultText;
      statusBarItem.tooltip = lastResultTooltip;
      return;
    }

    const scope = await GitService.getActiveScope(cwd);
    const profile = pm.getProfileByEmail(activeEmail);
    const alias = profile ? profile.alias : "Unregistered";

    lastResultText = `GitID: ${alias} (${scope})`;
    lastResultTooltip = `Active GitID: ${alias}\nName: ${activeConfig.name || "(not set)"}\nEmail: ${activeConfig.email}\nSigning: ${activeConfig.gpgSign ? "Enabled" : "Disabled"}\nKey: ${activeConfig.signingKey || "None"}\nScope: ${scope}`;

    statusBarItem.text = lastResultText;
    statusBarItem.tooltip = lastResultTooltip;
  } catch {
    lastResultText = "$(alert) GitID: Unknown";
    lastResultTooltip = "Failed to retrieve active git configuration.";
    statusBarItem.text = lastResultText;
    statusBarItem.tooltip = lastResultTooltip;
  }
}
