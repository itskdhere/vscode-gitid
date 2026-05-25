import * as vscode from "vscode";
import { ProfileManager } from "./services/profileManager";
import { GitService } from "./services/gitService";
import { GitIDTreeDataProvider } from "./tree/treeDataProvider";
import { GitProfileTreeItem } from "./tree/treeItem";
import { initStatusBar, updateStatusBar } from "./ui/statusBar";
import { applyProfileFlow } from "./ui/flows/applyProfile";
import { createProfileFlow } from "./ui/flows/createProfile";
import { editProfileFlow } from "./ui/flows/editProfile";
import { manageProfilesFlow } from "./ui/flows/manageProfiles";
import { switchProfileFlow } from "./ui/flows/switchProfile";
import { getActiveWorkspacePath } from "./utils/workspace";

let profileManager: ProfileManager;
let treeDataProvider: GitIDTreeDataProvider;

export function activate(context: vscode.ExtensionContext) {
  profileManager = new ProfileManager(context);

  initStatusBar(context);

  treeDataProvider = new GitIDTreeDataProvider(
    profileManager,
    getActiveWorkspacePath,
    () => {
      updateStatusBar(profileManager);
    }
  );

  const treeView = vscode.window.createTreeView("gitid-profiles-view", {
    treeDataProvider,
    dragAndDropController: treeDataProvider,
    showCollapseAll: true,
  });
  context.subscriptions.push(treeView);

  const switchCommand = vscode.commands.registerCommand(
    "gitid.switchProfile",
    async () => {
      await switchProfileFlow(profileManager);
      await treeDataProvider.updateActiveEmail();
    }
  );

  const createCommand = vscode.commands.registerCommand(
    "gitid.createProfile",
    async () => {
      const newProfile = await createProfileFlow(profileManager);
      if (newProfile) {
        const applySelect = await vscode.window.showQuickPick(
          ["Apply Now", "Just Save"],
          { placeHolder: `Apply profile "${newProfile.alias}" immediately?` }
        );
        if (applySelect === "Apply Now") {
          await applyProfileFlow(newProfile);
        }
      }
      await updateStatusBar(profileManager);
      await treeDataProvider.updateActiveEmail();
    }
  );

  const manageCommand = vscode.commands.registerCommand(
    "gitid.manageProfiles",
    async () => {
      await manageProfilesFlow(profileManager);
      await updateStatusBar(profileManager);
      await treeDataProvider.updateActiveEmail();
    }
  );

  const applyFromTreeCommand = vscode.commands.registerCommand(
    "gitid.applyProfileFromTree",
    async (item: GitProfileTreeItem) => {
      const profile = item?.profile;
      if (profile) {
        await applyProfileFlow(profile);
        await updateStatusBar(profileManager);
        await treeDataProvider.updateActiveEmail();
      }
    }
  );

  const editFromTreeCommand = vscode.commands.registerCommand(
    "gitid.editProfileFromTree",
    async (item: GitProfileTreeItem) => {
      const profile = item?.profile;
      if (profile) {
        await editProfileFlow(profileManager, profile);
        await updateStatusBar(profileManager);
        await treeDataProvider.updateActiveEmail();
      }
    }
  );

  const deleteFromTreeCommand = vscode.commands.registerCommand(
    "gitid.deleteProfileFromTree",
    async (item: GitProfileTreeItem) => {
      const profile = item?.profile;
      if (profile) {
        const confirm = await vscode.window.showQuickPick(["No", "Yes"], {
          placeHolder: `Confirm deletion of profile "${profile.alias}"?`,
        });
        if (confirm === "Yes") {
          await profileManager.deleteProfile(profile.id);
          vscode.window.showInformationMessage(
            `GitID: Deleted profile "${profile.alias}".`
          );
          await updateStatusBar(profileManager);
          await treeDataProvider.updateActiveEmail();
        }
      }
    }
  );

  const saveActiveAsProfileCommand = vscode.commands.registerCommand(
    "gitid.saveActiveAsProfile",
    async () => {
      const cwd = getActiveWorkspacePath();
      const activeConfig = await GitService.getCurrentConfig(cwd);

      const newProfile = await createProfileFlow(profileManager, {
        name: activeConfig.name,
        email: activeConfig.email,
        signingKey: activeConfig.signingKey,
        gpgSign: activeConfig.gpgSign,
      });

      if (newProfile) {
        const applySelect = await vscode.window.showQuickPick(
          ["Apply Now", "Just Save"],
          { placeHolder: `Apply profile "${newProfile.alias}" immediately?` }
        );
        if (applySelect === "Apply Now") {
          await applyProfileFlow(newProfile);
        }
        await updateStatusBar(profileManager);
        await treeDataProvider.updateActiveEmail();
      }
    }
  );

  const refreshTreeCommand = vscode.commands.registerCommand(
    "gitid.refreshTree",
    async () => {
      await updateStatusBar(profileManager);
      await treeDataProvider.updateActiveEmail();
      vscode.window.showInformationMessage(
        "GitID: Refreshed active configuration and profiles."
      );
    }
  );

  context.subscriptions.push(
    switchCommand,
    createCommand,
    manageCommand,
    applyFromTreeCommand,
    editFromTreeCommand,
    deleteFromTreeCommand,
    saveActiveAsProfileCommand,
    refreshTreeCommand
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      updateStatusBar(profileManager);
      treeDataProvider.updateActiveEmail();
    }),
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      updateStatusBar(profileManager);
      treeDataProvider.updateActiveEmail();
    })
  );

  updateStatusBar(profileManager);
  treeDataProvider.updateActiveEmail();
}

export function deactivate() {}
