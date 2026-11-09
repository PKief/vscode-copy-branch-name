import * as vscode from 'vscode';

let currentStatusBarMessage: vscode.Disposable | undefined;

export const showStatusBarButton = (command: string): vscode.StatusBarItem => {
  const button = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    9999
  );
  button.text = '$(copy)';
  button.tooltip = 'Copy current branch name';
  button.accessibilityInformation = {
    label: 'Click this button to copy the current branch name',
  };
  button.command = command;
  button.show();
  return button;
};

export const disposeStatusBarToast = () => {
  currentStatusBarMessage?.dispose();
  currentStatusBarMessage = undefined;
};

export const showToastInStatusBar = (message: string, milliseconds = 5000) => {
  disposeStatusBarToast();
  currentStatusBarMessage = vscode.window.setStatusBarMessage(message, milliseconds);
};
