import {
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
  type Mock,
  mock,
  spyOn,
} from 'bun:test';
import * as vscode from 'vscode';
import type { GitRepository } from '../types/git';
import * as gitUtils from '../utils/git';
import * as statusBar from '../utils/statusbar';
import { copyCurrentBranchNameCommand } from './copy-branch';

describe('copyCurrentBranchNameCommand', () => {
  let getGitRepositoryMock: Mock<() => Promise<GitRepository | null>>;

  beforeEach(async () => {
    getGitRepositoryMock = mock();

    mock.module('vscode', () => ({
      env: {
        clipboard: {
          writeText: mock(),
        },
      },
      window: {
        showErrorMessage: mock(),
        setStatusBarMessage: mock(),
        activeTextEditor: {
          document: {
            uri: undefined,
          },
        },
      },
    }));
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should copy the current branch name to clipboard and show a toast message', async () => {
    const branchName = 'main';
    getGitRepositoryMock = mock(() =>
      Promise.resolve({
        state: {
          // biome-ignore lint/style/useNamingConvention: Given by the Git API
          HEAD: {
            name: branchName,
          },
        },
      } as GitRepository)
    );
    spyOn(gitUtils, 'getGitRepository').mockImplementation(
      getGitRepositoryMock
    );

    const showToastInStatusBar = spyOn(statusBar, 'showToastInStatusBar');
    await copyCurrentBranchNameCommand();

    expect(vscode.env.clipboard.writeText).toHaveBeenCalledWith(branchName);
    expect(showToastInStatusBar).toHaveBeenCalledWith(
      `$(save) "${branchName}" copied to clipboard`
    );
  });

  it('should show an error message if the branch name cannot be copied to clipboard', async () => {
    const branchName = 'main';
    getGitRepositoryMock = mock(() =>
      Promise.resolve({
        state: {
          // biome-ignore lint/style/useNamingConvention: Given by the Git API
          HEAD: {
            name: branchName,
          },
        },
      } as GitRepository)
    );
    spyOn(gitUtils, 'getGitRepository').mockImplementation(
      getGitRepositoryMock
    );
    const error = new Error('Clipboard error');
    spyOn(vscode.env.clipboard, 'writeText').mockRejectedValue(error);

    await expect(copyCurrentBranchNameCommand()).rejects.toThrow(error);
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      'Could not write branch name to clipboard. Something went completely wrong 🙈. Please report the behavior as issue in the repository!'
    );
  });

  it('should show an error message if the repository is not found', async () => {
    getGitRepositoryMock = mock(() => Promise.resolve(null));
    spyOn(gitUtils, 'getGitRepository').mockImplementation(
      getGitRepositoryMock
    );

    await expect(copyCurrentBranchNameCommand()).rejects.toThrow(
      'Could not find current branch name. The extension could not read the Git repository of the current workspace.'
    );
    expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
      'Could not find current branch name. The extension could not read the Git repository of the current workspace.'
    );
  });
});
