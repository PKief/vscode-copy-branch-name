import {
  type Mock,
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
  mock,
  spyOn,
} from 'bun:test';
import { type Extension, window } from 'vscode';
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

  it('should return null if no active text editor is found', () => {
    spyOn(window, 'activeTextEditor').mockReturnValue(null as never);
    const repo = getGitRepository();
    expect(repo).toBeNull();
  });

  it('should return the repository if active text editor and git extension are found', () => {
    const expectedRepository = {
      rootUri: { path: '' },
      // biome-ignore lint/style/useNamingConvention: Given by the Git API
      state: { HEAD: { name: 'main' } },
    } as GitRepository;
    const repo = getGitRepository();
    expect(repo).toStrictEqual(expectedRepository);
  });
});
