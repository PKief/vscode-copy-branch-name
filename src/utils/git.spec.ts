import {
  type Mock,
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
  mock,
} from 'bun:test';
import { type Extension } from 'vscode';
import type { GitExtension, GitRepository } from '../types/git';
import { getGitRepository } from './git';

describe('getGitRepository', () => {
  let getExtensionMock: Mock<
    () => Pick<Extension<GitExtension>, 'exports'> | undefined
  >;

  beforeEach(() => {
    getExtensionMock = mock(() => ({
      exports: {
        getAPI: mock(() => ({
          repositories: [],
          getRepository: mock(() => ({
            rootUri: { path: '' },
            // biome-ignore lint/style/useNamingConvention: Given by the Git API
            state: { HEAD: { name: 'main' } },
          })),
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
      },
    }));
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should return null if no git extension is found', () => {
    getExtensionMock = mock(() => undefined);
    mock.module('vscode', () => ({
      extensions: {
        getExtension: getExtensionMock,
      },
    }));

    const repo = getGitRepository();
    expect(repo).toBeNull();
    expect(getExtensionMock).toMatchSnapshot();
  });

  it('should return the repository from the active text editor if found', () => {
    const expectedRepository = {
      rootUri: { path: '' },
      // biome-ignore lint/style/useNamingConvention: Given by the Git API
      state: { HEAD: { name: 'main' } },
    } as GitRepository;
    const repo = getGitRepository();
    expect(repo).toStrictEqual(expectedRepository);
  });

  it('should return the repository from the extensionApi.repositories if no active text editor is found', () => {
    const expectedRepository = {
      rootUri: { path: '' },
      // biome-ignore lint/style/useNamingConvention: Given by the Git API
      state: { HEAD: { name: 'main' } },
    } as GitRepository;

    getExtensionMock = mock(() => ({
      exports: {
        getAPI: mock(() => ({
          repositories: [expectedRepository],
          getRepository: mock(() => null),
        })),
      },
    }));

    mock.module('vscode', () => ({
      extensions: {
        getExtension: getExtensionMock,
      },
      window: {
        activeTextEditor: null,
      },
    }));

    const repo = getGitRepository();
    expect(repo).toStrictEqual(expectedRepository);
  });

  it('should return null if no active text editor and no repository with an active branch is found', () => {
    getExtensionMock = mock(() => ({
      exports: {
        getAPI: mock(() => ({
          repositories: [],
          getRepository: mock(() => null),
        })),
      },
    }));

    mock.module('vscode', () => ({
      extensions: {
        getExtension: getExtensionMock,
      },
      window: {
        activeTextEditor: null,
      },
    }));

    const repo = getGitRepository();
    expect(repo).toBeNull();
  });
});
