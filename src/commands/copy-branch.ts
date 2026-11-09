import * as vscode from 'vscode';
import { getGitRepository } from '../utils/git';
import { showToastInStatusBar } from '../utils/statusbar';

export const copyCurrentBranchNameCommand = async (): Promise<void> => {
  try {
    const repository = await getGitRepository();
    if (repository === undefined) {
      return; // Repository selection was cancelled.
    }
    if (repository === null) {
      await vscode.window.showErrorMessage('No Git repository found in the current workspace.');
      return;
    }

    const branchName = repository.state.HEAD?.name;
    if (!branchName) {
      await vscode.window.showInformationMessage(
        'No branch name is available. The repository may have a detached HEAD.'
      );
      return;
    }

    await vscode.env.clipboard.writeText(branchName);
    showToastInStatusBar(`$(save) "${branchName}" copied to clipboard`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await vscode.window.showErrorMessage(`Could not copy the branch name: ${message}`);
  }
};
