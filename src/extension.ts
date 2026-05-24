import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "gitid" is now active!');

  const disposable = vscode.commands.registerCommand("gitid.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from GitID!");
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
