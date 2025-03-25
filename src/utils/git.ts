import { extensions, window } from 'vscode';
import type { GitExtension, GitRepository } from '../types/git';

export const getGitRepository = (): GitRepository | null => {
  const gitExtension =
    extensions.getExtension<GitExtension>('vscode.git')?.exports;

  const extensionApi = gitExtension?.getAPI(1);
  if (!extensionApi) {
    return null;
  }

  const activeEditor = window.activeTextEditor;
  if (activeEditor) {
    const activeFilePath = activeEditor.document.uri;
    return extensionApi.getRepository(activeFilePath);
  }

  // If no active editor, find the repository with an active branch
  const activeRepository = extensionApi.repositories.find(
    (repo) => repo.state.HEAD && repo.state.HEAD.name
  );

  return activeRepository || null;
};
