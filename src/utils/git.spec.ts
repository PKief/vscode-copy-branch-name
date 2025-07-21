import {
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
  type Mock,
  mock,
} from 'bun:test';
import { type Extension } from 'vscode';
import type { GitExtension, GitRepository } from '../types/git';
import { getGitRepository } from './git';

describe('getGitRepository', () => {
  let getExtensionMock: Mock<
    () => Pick<Extension<GitExtension>, 'exports'> | undefined
  >;
  let showQuickPickMock: Mock<
    () => Promise<{ repository: GitRepository } | undefined>
  >;

  const createMockUri = (path: string) => ({
    scheme: 'file',
    authority: '',
    path: path,
    query: '',
    fragment: '',
    fsPath: path,
    with: () => createMockUri(path),
    toJSON: () => ({ scheme: 'file', path }),
  });

  const createMockRepository = (path: string): GitRepository =>
    ({
      rootUri: createMockUri(path),
      // biome-ignore lint/style/useNamingConvention: Given by the Git API
      state: { HEAD: { name: 'main' } },
    }) as GitRepository;

  beforeEach(() => {
    showQuickPickMock = mock(() => Promise.resolve(undefined));

    getExtensionMock = mock(() => ({
      exports: {
        getAPI: mock(() => ({
          repositories: [],
          getRepository: mock(() => createMockRepository('/test')),
        })),
      },
    }));

    mock.module('vscode', () => ({
      extensions: {
        getExtension: getExtensionMock,
      },
      window: {
        activeTextEditor: {
          document: {
            uri: undefined,
          },
        },
        showQuickPick: showQuickPickMock,
      },
      workspace: {
        workspaceFolders: undefined,
        getWorkspaceFolder: mock(() => undefined),
      },
      // biome-ignore lint/style/useNamingConvention: VS Code API
      Uri: {
        file: (path: string) => ({
          scheme: 'file',
          path: path,
          fsPath: path,
        }),
      },
    }));
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should return null if no git extension is found', async () => {
    getExtensionMock = mock(() => undefined);
    mock.module('vscode', () => ({
      extensions: {
        getExtension: getExtensionMock,
      },
    }));

    const repo = await getGitRepository();
    expect(repo).toBeNull();
    expect(getExtensionMock).toMatchSnapshot();
  });

  it('should return the repository from the active text editor if found', async () => {
    // Create a matching repository that will be returned from getRepository
    const expectedRepository = createMockRepository('/test');

    // Mock the active text editor with a URI
    mock.module('vscode', () => ({
      extensions: {
        getExtension: mock(() => ({
          exports: {
            getAPI: mock(() => ({
              repositories: [],
              getRepository: mock(() => expectedRepository), // Returns repo for active editor
            })),
          },
        })),
      },
      window: {
        activeTextEditor: {
          document: {
            uri: createMockUri('/test/file.txt'),
          },
        },
        showQuickPick: showQuickPickMock,
      },
      workspace: {
        workspaceFolders: undefined,
        getWorkspaceFolder: mock(() => undefined),
      },
      // biome-ignore lint/style/useNamingConvention: VS Code API
      Uri: {
        file: createMockUri,
      },
    }));

    const repo = await getGitRepository();
    expect(repo).toEqual(expectedRepository);
  });

  it('should return single repository directly if no active editor and only one repo available', async () => {
    const expectedRepository = createMockRepository('/test');

    mock.module('vscode', () => ({
      extensions: {
        getExtension: mock(() => ({
          exports: {
            getAPI: mock(() => ({
              repositories: [expectedRepository],
              getRepository: mock(() => null), // No repo for active editor
            })),
          },
        })),
      },
      window: {
        activeTextEditor: null, // No active editor
        showQuickPick: showQuickPickMock,
      },
      workspace: {
        workspaceFolders: [
          {
            uri: createMockUri('/test'),
            name: 'TestWorkspace',
            index: 0,
          },
        ],
        getWorkspaceFolder: mock(() => ({
          uri: createMockUri('/test'),
          name: 'TestWorkspace',
          index: 0,
        })),
      },
      // biome-ignore lint/style/useNamingConvention: VS Code API
      Uri: {
        file: createMockUri,
      },
    }));

    const repo = await getGitRepository();
    expect(repo).toEqual(expectedRepository);
    // Should NOT call showQuickPick for single repository
    expect(showQuickPickMock).not.toHaveBeenCalled();
  });

  it('should show repository picker when multiple repositories are available', async () => {
    const repo1 = createMockRepository('/test1');
    const repo2 = createMockRepository('/test2');
    const expectedRepository = repo1;

    // Mock user selection from QuickPick
    showQuickPickMock = mock(() =>
      Promise.resolve({ repository: expectedRepository })
    );

    mock.module('vscode', () => ({
      extensions: {
        getExtension: mock(() => ({
          exports: {
            getAPI: mock(() => ({
              repositories: [repo1, repo2], // Multiple repositories
              getRepository: mock(() => null), // No repo for active editor
            })),
          },
        })),
      },
      window: {
        activeTextEditor: null, // No active editor
        showQuickPick: showQuickPickMock,
      },
      workspace: {
        workspaceFolders: [
          {
            uri: createMockUri('/test1'),
            name: 'TestWorkspace1',
            index: 0,
          },
          {
            uri: createMockUri('/test2'),
            name: 'TestWorkspace2',
            index: 1,
          },
        ],
        getWorkspaceFolder: mock((uri) => ({
          uri: uri,
          name: uri.path.includes('test1')
            ? 'TestWorkspace1'
            : 'TestWorkspace2',
          index: uri.path.includes('test1') ? 0 : 1,
        })),
      },
      // biome-ignore lint/style/useNamingConvention: VS Code API
      Uri: {
        file: createMockUri,
      },
    }));

    const repo = await getGitRepository();
    expect(repo).toEqual(expectedRepository);
    expect(showQuickPickMock).toHaveBeenCalled();
  });

  it('should return null if user cancels repository picker', async () => {
    const repo1 = createMockRepository('/test1');
    const repo2 = createMockRepository('/test2');

    // Mock user cancellation (returns undefined)
    showQuickPickMock = mock(() => Promise.resolve(undefined));

    mock.module('vscode', () => ({
      extensions: {
        getExtension: mock(() => ({
          exports: {
            getAPI: mock(() => ({
              repositories: [repo1, repo2], // Multiple repositories - will show picker
              getRepository: mock(() => null), // No repo for active editor
            })),
          },
        })),
      },
      window: {
        activeTextEditor: null, // No active editor
        showQuickPick: showQuickPickMock,
      },
      workspace: {
        workspaceFolders: [
          {
            uri: createMockUri('/test1'),
            name: 'TestWorkspace1',
            index: 0,
          },
          {
            uri: createMockUri('/test2'),
            name: 'TestWorkspace2',
            index: 1,
          },
        ],
        getWorkspaceFolder: mock((uri) => ({
          uri: uri,
          name: uri.path.includes('test1')
            ? 'TestWorkspace1'
            : 'TestWorkspace2',
          index: uri.path.includes('test1') ? 0 : 1,
        })),
      },
      // biome-ignore lint/style/useNamingConvention: VS Code API
      Uri: {
        file: createMockUri,
      },
    }));

    const repo = await getGitRepository();
    expect(repo).toBeNull();
    expect(showQuickPickMock).toHaveBeenCalled();
  });
});
