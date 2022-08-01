import clipboard from "clipboardy";
import * as vscode from "vscode";
import { GitExtension } from "./@types/vscode.git";

export const activate = (context: vscode.ExtensionContext) => {
  const copyButton = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    99999
  );
  copyButton.text = "Copy current branch";
  copyButton.command = "copy-branch-name.copy-current";
  copyButton.show();

  let disposable = vscode.commands.registerCommand(
    "copy-branch-name.copy-current",
    () => {
      const gitExtension =
        vscode.extensions.getExtension<GitExtension>("vscode.git")?.exports;
      if (gitExtension) {
        const api = gitExtension.getAPI(1);

        const repo = api.repositories[0];
        const branchName = (repo.state.HEAD && repo.state.HEAD.name) || "";
        clipboard.writeSync(branchName);
      }
    }
  );

  context.subscriptions.push(disposable);
};

export const deactivate = () => {};
