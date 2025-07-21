import * as path from 'path';
import { extensions, window, workspace } from 'vscode';
import type { GitExtension, GitRepository } from '../types/git';

interface RepositoryPickItem {
  label: string;
  description: string;
  repository: GitRepository;
}

export const getGitRepository = async (): Promise<GitRepository | null> => {
  const gitExtension =
    extensions.getExtension<GitExtension>('vscode.git')?.exports;

  const extensionApi = gitExtension?.getAPI(1);
  if (!extensionApi) {
    return null;
  }

  // Strategy 1: Use active editor's repository (primary method)
  const activeEditor = window.activeTextEditor;
  if (activeEditor) {
    const activeFilePath = activeEditor.document.uri;
    const repo = extensionApi.getRepository(activeFilePath);
    if (repo) {
      return repo;
    }
  }

  // Strategy 2: If no active editor, check available repositories
  const repositories = extensionApi.repositories.filter(
    (repo) => repo.state.HEAD && repo.state.HEAD.name
  );

  if (repositories.length === 0) {
    return null;
  }

  // If only one repository, use it directly
  if (repositories.length === 1) {
    return repositories[0];
  }

  // Multiple repositories - show picker
  return await showRepositoryPicker(repositories);
};

const showRepositoryPicker = async (
  repositories: GitRepository[]
): Promise<GitRepository | null> => {
  const items: RepositoryPickItem[] = repositories.map((repo) => {
    const branchName = repo.state.HEAD?.name || 'unknown';
    const workspaceFolder = workspace.getWorkspaceFolder(repo.rootUri);

    let label: string;
    if (workspaceFolder) {
      label = `${workspaceFolder.name} (${branchName})`;
    } else {
      // Fallback to repository root folder name
      const repoPath = repo.rootUri.fsPath;
      const repoName = path.basename(repoPath) || 'Unknown Repository';
      label = `${repoName} (${branchName})`;
    }

    return {
      label,
      description: repo.rootUri.fsPath,
      repository: repo,
    };
  });

  const selected = await window.showQuickPick(items, {
    placeHolder: 'Select repository to copy branch name from',
    matchOnDescription: true,
  });

  return selected?.repository || null;
};
