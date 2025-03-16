export const vscodeApiMock = {
  extensions: {
    getExtension: (_extensionId: string) => ({
      exports: {
        getAPI: (_version: number) => ({
          getRepository: (_filePath: string) => ({}),
        }),
      },
    }),
  },
  window: {
    activeTextEditor: undefined,
    setStatusBarMessage: () => {},
  },

  // biome-ignore lint/style/useNamingConvention: mock enum
  StatusBarAlignment: {
    // biome-ignore lint/style/useNamingConvention: mock enum
    Left: 1,

    // biome-ignore lint/style/useNamingConvention: mock enum
    Right: 2,
  },

  env: {},
};
