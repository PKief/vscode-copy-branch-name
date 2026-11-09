import type { Uri } from 'vscode';

export type GitExtensionApi = {
  repositories: GitRepository[];
  getRepository(uri: Uri): GitRepository | null;
};

export type GitExtension = {
  getAPI: (version: number) => GitExtensionApi;
};

export type GitRepository = {
  rootUri: Uri;
  state: {
    HEAD: { name?: string } | undefined;
  };
};
