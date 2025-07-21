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
    activeTerminal: undefined,
    setStatusBarMessage: () => {},
    showQuickPick: () => Promise.resolve(undefined),
  },
  workspace: {
    workspaceFolders: undefined,
    getWorkspaceFolder: () => undefined,
  },
  // biome-ignore lint/style/useNamingConvention: mock class
  Uri: {
    file: (path: string) => ({
      scheme: 'file',
      authority: '',
      path: path,
      query: '',
      fragment: '',
      fsPath: path,
      with: () => ({}),
      toJSON: () => ({}),
    }),
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
