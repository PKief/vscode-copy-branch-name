import * as vscode from 'vscode';
import { copyCurrentBranchNameCommand } from './commands';
import { showStatusBarButton } from './utils/statusbar';

const commands: { id: string; callback: () => void }[] = [
  { id: 'copy-current', callback: copyCurrentBranchNameCommand },
];

export const activate = (context: vscode.ExtensionContext) => {
  const extensionId = context.extension.id;
  showStatusBarButton({
    alignment: vscode.StatusBarAlignment.Left,
    priority: 9999,
    text: '$(copy)',
    tooltip: 'Copy current branch name',
    accessibilityInformation:
      'Click this button to copy the current branch name',
    command: `${extensionId}.copy-current`,
    visible: true,
  });

  commands.forEach((command) => {
    const disposable = vscode.commands.registerCommand(
      `${extensionId}.${command.id}`,
      command.callback
    );

    context.subscriptions.push(disposable);
  });
};
