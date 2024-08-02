import * as vscode from 'vscode';
import { GitExtension } from '../types/git';

export const getGitRepository = () => {
  const gitExtension =
    vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports;

  return gitExtension?.getAPI(1).repositories?.[0];
};
