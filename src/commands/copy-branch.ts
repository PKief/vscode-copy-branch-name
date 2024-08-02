import * as vscode from 'vscode';
import { getGitRepository } from '../utils/git';
import { showToastInStatusBar } from '../utils/statusbar';

export const copyCurrentBranchNameCommand = async () => {
  const repo = getGitRepository();
  if (repo) {
    const branchName = (repo.state.HEAD && repo.state.HEAD.name) || '';
    try {
      await vscode.env.clipboard.writeText(branchName);
      showToastInStatusBar(`$(save) "${branchName}" copied to clipboard`);
    } catch (error) {
      vscode.window.showErrorMessage(
        'Could not write branch name to clipboard. Something went completely wrong 🙈. Please report the behavior as issue in the repository!'
      );
      throw error;
    }
  } else {
    const errorMessage =
      'Could not find current branch name. The extension could not read the Git repository of the current workspace.';
    vscode.window.showErrorMessage(errorMessage);
    throw new Error(errorMessage);
  }
};
