import { Uri } from 'vscode';

export type GitExtensionApi = {
  getRepository(uri: Uri): GitRepository | null;
};

export type GitExtension = {
  getAPI: (version: number) => GitExtensionApi;
};

export type GitRepository = {
  state: {
    // biome-ignore lint/style/useNamingConvention: Given by the Git API
    HEAD: {
      name: string;
    };
  };
};
