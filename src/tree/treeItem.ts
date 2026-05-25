import * as vscode from "vscode";
import { GitProfile } from "../models/gitProfile";

export class GitProfileTreeItem extends vscode.TreeItem {
  constructor(
    public readonly type: "profile" | "detail" | "activeConfig" | "placeholder",
    label: string,
    public readonly profile?: GitProfile,
    public readonly detailKey?: string,
    collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.None
  ) {
    super(label, collapsibleState);
  }
}
