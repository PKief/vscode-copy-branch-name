import * as vscode from 'vscode';
import { copyCurrentBranchNameCommand } from './commands/copy-branch';
import { showStatusBarButton, disposeStatusBarToast } from './utils/statusbar';

export const activate = (context: vscode.ExtensionContext) => {
  const command = `${context.extension.packageJSON.name}.copy-current`;

  context.subscriptions.push(
    vscode.commands.registerCommand(command, copyCurrentBranchNameCommand),
    showStatusBarButton(command),
    new vscode.Disposable(disposeStatusBarToast)
  );
};
