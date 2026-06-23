import * as vscode from "vscode";
import { GitProfile } from "../models/gitProfile";
import { ProfileManager } from "../services/profileManager";
import { GitService } from "../services/gitService";
import { GitProfileTreeItem } from "./treeItem";

export class GitIDTreeDataProvider
  implements
    vscode.TreeDataProvider<GitProfileTreeItem>,
    vscode.TreeDragAndDropController<GitProfileTreeItem>
{
  public readonly dragMimeTypes = [
    "application/vnd.code.tree.gitid-profiles-view",
  ];
  public readonly dropMimeTypes = [
    "application/vnd.code.tree.gitid-profiles-view",
  ];

  private _onDidChangeTreeData = new vscode.EventEmitter<
    GitProfileTreeItem | undefined | null | void
  >();
  public readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private activeEmail: string | undefined;

  constructor(
    private readonly profileManager: ProfileManager,
    private readonly getActiveWorkspacePath: () => string | undefined,
    private readonly onDidChangeProfiles?: () => void
  ) {}

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  public async updateActiveEmail(): Promise<void> {
    const cwd = this.getActiveWorkspacePath();
    try {
      this.activeEmail = await GitService.getActiveEmail(cwd);
    } catch {
      this.activeEmail = undefined;
    }
    this.refresh();
  }

  public getTreeItem(element: GitProfileTreeItem): vscode.TreeItem {
    return element;
  }

  public async getChildren(
    element?: GitProfileTreeItem
  ): Promise<GitProfileTreeItem[]> {
    if (!element) {
      const items: GitProfileTreeItem[] = [];

      const cwd = this.getActiveWorkspacePath();
      let activeConfig: any;
      let activeEmailVal = "";
      let matchingProfile: GitProfile | undefined;
      let scope = "Global";

      try {
        activeConfig = await GitService.getCurrentConfig(cwd);
        activeEmailVal = activeConfig.email || "";
        matchingProfile = activeEmailVal
          ? this.profileManager.getProfileByEmail(activeEmailVal)
          : undefined;
        scope = await GitService.getActiveScope(cwd);
      } catch {}

      const profiles = this.profileManager.getProfiles();
      if (!matchingProfile && activeConfig) {
        const placeholderNode = new GitProfileTreeItem(
          "placeholder",
          "Register Active Profile",
          undefined,
          undefined,
          vscode.TreeItemCollapsibleState.None
        );
        placeholderNode.description = "";
        placeholderNode.tooltip =
          "Click here to register your current active unregistered Git identity as a profile.";
        placeholderNode.iconPath = new vscode.ThemeIcon("add");
        placeholderNode.command = {
          command: "gitid.saveActiveAsProfile",
          title: "Register Active Profile",
        };
        placeholderNode.contextValue = "placeholder";
        items.push(placeholderNode);
      }

      const shouldShowActiveNode = !matchingProfile || profiles.length === 0;

      if (shouldShowActiveNode && activeConfig) {
        try {
          const activeProfile: GitProfile = {
            id: "active",
            alias: "Active Git Identity",
            name: activeConfig.name || "(not set)",
            email: activeConfig.email || "(not set)",
            gpgSign: activeConfig.gpgSign || false,
            signingKey: activeConfig.signingKey,
          };

          const label = `Active GitID: Unregistered`;

          const activeNode = new GitProfileTreeItem(
            "activeConfig",
            label,
            activeProfile,
            undefined,
            vscode.TreeItemCollapsibleState.Expanded
          );
          activeNode.description = "";
          activeNode.contextValue = "activeConfig-unregistered";
          activeNode.iconPath = new vscode.ThemeIcon(
            "circle-outline",
            new vscode.ThemeColor("terminal.ansiYellow")
          );
          activeNode.tooltip = `Active GitID: Unregistered\nName: ${activeProfile.name}\nEmail: ${activeProfile.email}\nSigning: ${activeProfile.gpgSign ? "Enabled" : "Disabled"}\nKey: ${activeProfile.signingKey || "None"}\nScope: ${scope}\n\nClick the "+" icon next to this node to register it as a profile.`;

          items.push(activeNode);
        } catch {
          const activeNode = new GitProfileTreeItem(
            "activeConfig",
            "Active Git Identity",
            undefined,
            undefined,
            vscode.TreeItemCollapsibleState.None
          );
          activeNode.description = "(error reading)";
          activeNode.iconPath = new vscode.ThemeIcon(
            "circle-outline",
            new vscode.ThemeColor("terminal.ansiRed")
          );
          items.push(activeNode);
        }
      }

      if (profiles.length > 0) {
        for (const profile of profiles) {
          const isActive =
            this.activeEmail &&
            this.activeEmail.toLowerCase().trim() ===
              profile.email.toLowerCase().trim();

          const label = isActive
            ? `GitID: ${profile.alias} [${scope}]`
            : `GitID: ${profile.alias}`;

          const treeItem = new GitProfileTreeItem(
            "profile",
            label,
            profile,
            undefined,
            vscode.TreeItemCollapsibleState.Collapsed
          );
          treeItem.description = "";
          treeItem.contextValue = "profile";

          if (isActive) {
            treeItem.iconPath = new vscode.ThemeIcon(
              "check",
              new vscode.ThemeColor("terminal.ansiGreen")
            );
            treeItem.tooltip = `Active GitID: ${profile.alias}\nName: ${profile.name}\nEmail: ${profile.email}\nSigning: ${profile.gpgSign ? "Enabled" : "Disabled"}\nKey: ${profile.signingKey || "None"}\nScope: ${scope}`;
          } else {
            treeItem.iconPath = new vscode.ThemeIcon(
              "circle-outline",
              new vscode.ThemeColor("terminal.ansiWhite")
            );
            treeItem.tooltip = `GitID Profile: ${profile.alias}\nName: ${profile.name}\nEmail: ${profile.email}\nSigning: ${profile.gpgSign ? "Enabled" : "Disabled"}\nKey: ${profile.signingKey || "None"}`;
          }

          items.push(treeItem);
        }
      }
      if (cwd && scope === "Local") {
        let globalProfile: GitProfile | undefined;
        try {
          const globalConfig = await GitService.getGlobalConfig();
          globalProfile = {
            id: "global",
            alias: "Global Profile",
            name: globalConfig.name || "(not set)",
            email: globalConfig.email || "(not set)",
            gpgSign: globalConfig.gpgSign || false,
            signingKey: globalConfig.signingKey,
          };
        } catch {}

        const useGlobalNode = new GitProfileTreeItem(
          "placeholder",
          "Global Profile",
          globalProfile,
          undefined,
          vscode.TreeItemCollapsibleState.Collapsed
        );
        useGlobalNode.description = "Click to use";
        let tooltip =
          "Unset local workspace identity configurations to inherit global settings";
        if (
          globalProfile &&
          (globalProfile.name !== "(not set)" ||
            globalProfile.email !== "(not set)")
        ) {
          tooltip += `\n\nInherited global settings:\nName: ${globalProfile.name}\nEmail: ${globalProfile.email}`;
        }
        useGlobalNode.tooltip = tooltip;
        useGlobalNode.iconPath = new vscode.ThemeIcon("globe");
        useGlobalNode.command = {
          command: "gitid.useGlobalProfile",
          title: "Use Global Profile",
        };
        useGlobalNode.contextValue = "use-global-profile";
        items.push(useGlobalNode);
      }

      return items;
    } else {
      if (
        (element.type === "profile" ||
          element.type === "activeConfig" ||
          (element.type === "placeholder" &&
            element.profile?.id === "global")) &&
        element.profile
      ) {
        const profile = element.profile;
        const children: GitProfileTreeItem[] = [];

        const nameItem = new GitProfileTreeItem(
          "detail",
          `Name: ${profile.name}`,
          profile,
          "name"
        );
        nameItem.iconPath = new vscode.ThemeIcon("person");
        children.push(nameItem);

        const emailItem = new GitProfileTreeItem(
          "detail",
          `Email: ${profile.email}`,
          profile,
          "email"
        );
        emailItem.iconPath = new vscode.ThemeIcon("mail");
        children.push(emailItem);

        const gpgItem = new GitProfileTreeItem(
          "detail",
          `Signing: ${profile.gpgSign ? "Enabled" : "Disabled"}`,
          profile,
          "gpgSign"
        );
        gpgItem.iconPath = new vscode.ThemeIcon("shield");
        children.push(gpgItem);

        if (profile.signingKey && profile.signingKey.trim() !== "") {
          const keyItem = new GitProfileTreeItem(
            "detail",
            `Key: ${profile.signingKey}`,
            profile,
            "signingKey"
          );
          keyItem.iconPath = new vscode.ThemeIcon("key");
          children.push(keyItem);
        }

        return children;
      }
      return [];
    }
  }

  public handleDrag(
    source: GitProfileTreeItem[],
    dataTransfer: vscode.DataTransfer,
    _token: vscode.CancellationToken
  ): Thenable<void> | void {
    const profilesToDrag = source.filter(
      (item) => item.type === "profile" && item.profile
    );
    if (profilesToDrag.length === 0) {
      return;
    }

    const ids = profilesToDrag.map((item) => item.profile!.id);
    dataTransfer.set(
      "application/vnd.code.tree.gitid-profiles-view",
      new vscode.DataTransferItem(JSON.stringify(ids))
    );
  }

  public async handleDrop(
    target: GitProfileTreeItem | undefined,
    dataTransfer: vscode.DataTransfer,
    _token: vscode.CancellationToken
  ): Promise<void> {
    const transferItem = dataTransfer.get(
      "application/vnd.code.tree.gitid-profiles-view"
    );
    if (!transferItem) {
      return;
    }

    let draggedIds: string[];
    try {
      draggedIds = JSON.parse(transferItem.value);
    } catch {
      return;
    }

    if (!draggedIds || draggedIds.length === 0) {
      return;
    }

    const profiles = this.profileManager.getProfiles();
    const draggedId = draggedIds[0];
    const sourceIndex = profiles.findIndex((p) => p.id === draggedId);
    if (sourceIndex === -1) {
      return;
    }

    const draggedProfile = profiles[sourceIndex];

    let targetIndex = profiles.length - 1;
    if (target && target.type === "profile" && target.profile) {
      targetIndex = profiles.findIndex((p) => p.id === target.profile!.id);
    }

    if (targetIndex === -1 || sourceIndex === targetIndex) {
      return;
    }

    profiles.splice(sourceIndex, 1);
    profiles.splice(targetIndex, 0, draggedProfile);

    await this.profileManager.saveProfiles(profiles);
    this.refresh();

    if (this.onDidChangeProfiles) {
      this.onDidChangeProfiles();
    }
  }
}
