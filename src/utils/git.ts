import { extensions, window, workspace } from 'vscode';
import type { GitExtension, GitRepository } from '../types/git';

interface RepositoryPickItem {
  label: string;
  description: string;
  repository: GitRepository;
}

const getRepositoryName = (uri: { path: string }): string =>
  uri.path.split('/').filter(Boolean).pop() || 'Unknown Repository';

// null means no repository is available; undefined means the picker was cancelled.
export const getGitRepository = async (): Promise<GitRepository | null | undefined> => {
  const gitExtension = extensions.getExtension<GitExtension>('vscode.git');
  const extensionApi = (await gitExtension?.activate())?.getAPI(1);

  if (!extensionApi) {
    return null;
  }

  const activeEditor = window.activeTextEditor;
  if (activeEditor) {
    const repository = extensionApi.getRepository(activeEditor.document.uri);
    if (repository) {
      return repository;
    }
  }

  const repositories = extensionApi.repositories;
  if (repositories.length === 1) {
    return repositories[0];
  }
  if (repositories.length === 0) {
    return null;
  }

  const items: RepositoryPickItem[] = repositories.map((repository) => {
    const branchName = repository.state.HEAD?.name || 'unknown';
    const workspaceFolder = workspace.getWorkspaceFolder(repository.rootUri);
    const repositoryName = getRepositoryName(repository.rootUri);

    return {
      label: `${workspaceFolder?.name || repositoryName} (${branchName})`,
      description: repository.rootUri.path,
      repository,
    };
  });

  const selected = await window.showQuickPick(items, {
    placeHolder: 'Select repository to copy branch name from',
    matchOnDescription: true,
  });

  return selected?.repository;
};
