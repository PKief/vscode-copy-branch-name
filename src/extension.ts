import clipboard from 'clipboardy';
import * as vscode from 'vscode';
import { GitExtension } from './@types/vscode.git';

export const activate = (context: vscode.ExtensionContext) => {
  showStatusBarButton();

  const disposable = vscode.commands.registerCommand(
    'copy-branch-name.copy-current',
    copyCurrentBranchNameCommand
  );

  context.subscriptions.push(disposable);
};

const showStatusBarButton = () => {
  const copyButton = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    9999
  );
  copyButton.text = '$(copy)';
  copyButton.tooltip = 'Copy current branch name';
  copyButton.accessibilityInformation = {
    label: 'Click this button to copy the current branch name',
  };
  copyButton.command = 'copy-branch-name.copy-current';
  copyButton.show();
};

const copyCurrentBranchNameCommand = () => {
  const gitExtension =
    vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports;
  if (gitExtension) {
    const api = gitExtension.getAPI(1);

    const repo = api.repositories[0];
    const branchName = (repo.state.HEAD && repo.state.HEAD.name) || '';
    clipboard.writeSync(branchName);

    vscode.window.showInformationMessage('Copied to clipboard');
  }
};

export const deactivate = () => {};
