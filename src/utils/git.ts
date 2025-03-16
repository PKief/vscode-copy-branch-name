import { extensions, window } from 'vscode';
import type { GitExtension } from '../types/git';

export const getGitRepository = () => {
  const gitExtension =
    extensions.getExtension<GitExtension>('vscode.git')?.exports;

  const extensionApi = gitExtension?.getAPI(1);
  if (!extensionApi) {
    return null;
  }

  const activeEditor = window.activeTextEditor;
  if (!activeEditor) {
    return null;
  }

  const activeFilePath = activeEditor.document.uri;
  return extensionApi.getRepository(activeFilePath);
};
