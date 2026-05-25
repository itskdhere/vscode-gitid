import * as vscode from "vscode";
import { GitProfile } from "../../models/gitProfile";
import { GitService } from "../../services/gitService";
import { getActiveWorkspacePath } from "../../utils/workspace";

export async function applyProfileFlow(profile: GitProfile): Promise<void> {
  const cwd = getActiveWorkspacePath();

  const scopePick = await vscode.window.showQuickPick(
    [
      {
        label: "Globally",
        description:
          "Write identity to ~/.gitconfig (default for all projects)",
      },
      {
        label: "Locally",
        description: "Write identity to .git/config in current workspace",
      },
    ],
    {
      placeHolder: `Where would you like to apply profile "${profile.alias}"?`,
    }
  );

  if (!scopePick) {
    return;
  }

  const isGlobal = scopePick.label === "Globally";

  if (!isGlobal && !cwd) {
    vscode.window.showErrorMessage(
      "No workspace folder is open. Cannot apply local configuration."
    );
    return;
  }

  try {
    await GitService.applyProfile(profile, isGlobal, cwd);
    vscode.window.showInformationMessage(
      `GitID: Applied profile "${profile.alias}" ${isGlobal ? "globally" : "locally"} successfully!`
    );
  } catch (err: any) {
    vscode.window.showErrorMessage(
      `GitID: Failed to apply profile. ${err.stderr || err.stdout || err.message || err}`
    );
  }
}
