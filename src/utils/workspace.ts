import * as vscode from "vscode";

export function getActiveWorkspacePath(): string | undefined {
  const activeEditor = vscode.window.activeTextEditor;
  if (
    activeEditor &&
    activeEditor.document &&
    !activeEditor.document.isUntitled
  ) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(
      activeEditor.document.uri
    );
    if (workspaceFolder) {
      return workspaceFolder.uri.fsPath;
    }
  }

  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length > 0) {
    return folders[0].uri.fsPath;
  }
  return undefined;
}
