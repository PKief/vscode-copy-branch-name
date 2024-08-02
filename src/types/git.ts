export type GitExtension = {
  getAPI: (version: number) => {
    repositories: GitRepository[];
  };
};

export type GitRepository = {
  state: {
    // biome-ignore lint/style/useNamingConvention: Given by the Git API
    HEAD: {
      name: string;
    };
  };
};
