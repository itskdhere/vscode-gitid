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

    if (isGlobal && cwd) {
      const activeScope = await GitService.getActiveScope(cwd);
      if (activeScope === "Local") {
        const choice = await vscode.window.showWarningMessage(
          "A local identity is active in this workspace and will override the global profile. Would you like to clear the local settings so the global profile takes effect here?",
          "Yes, Clear Local Identity",
          "No, Keep Local Identity"
        );
        if (choice === "Yes, Clear Local Identity") {
          await GitService.unsetLocalConfig(cwd);
          vscode.window.showInformationMessage(
            "GitID: Cleared local repository identity successfully! The global profile is now active here."
          );
        }
      }
    }
  } catch (err: any) {
    vscode.window.showErrorMessage(
      `GitID: Failed to apply profile. ${err.stderr || err.stdout || err.message || err}`
    );
  }
}
