import * as vscode from 'vscode';

let currentStatusBarMessageTimeout: Timer;

export type StatusBarButtonConfig = {
  alignment: vscode.StatusBarAlignment;
  priority: number;
  text: string;
  tooltip: string;
  accessibilityInformation: string;
  command: string;
  visible: boolean;
};

/**
 * Show button in status bar
 */
export const showStatusBarButton = (config: StatusBarButtonConfig) => {
  const copyButton = vscode.window.createStatusBarItem(
    config.alignment,
    config.priority
  );
  copyButton.text = config.text;
  copyButton.tooltip = config.tooltip;
  copyButton.accessibilityInformation = {
    label: config.accessibilityInformation,
  };
  copyButton.command = config.command;
  copyButton.show();
};

/**
 * Show a message in the status bar for a short time
 * @param message Message of the toast
 * @param milliseconds Time in milliseconds to show the toast
 */
export const showToastInStatusBar = (message: string, milliseconds = 5000) => {
  resetStatusBarToastTimeout();
  vscode.window.setStatusBarMessage(message);
  currentStatusBarMessageTimeout = setTimeout(() => {
    vscode.window.setStatusBarMessage('');
  }, milliseconds);
};

const resetStatusBarToastTimeout = () => {
  clearTimeout(currentStatusBarMessageTimeout);
};
