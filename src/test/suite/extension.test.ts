import * as assert from 'assert';
import { afterEach, beforeEach } from 'mocha';
import { createSandbox, SinonSandbox } from 'sinon';
import * as vscode from 'vscode';
import { GitExtension, Repository } from '../../@types/vscode.git';
import { copyCurrentBranchNameCommand } from '../../commands';

const testBranchName = 'my-branch';
const mockGitExtension = {
  exports: {
    getAPI: (version: number) => ({
      repositories: [
        {
          state: {
            HEAD: {
              name: testBranchName,
            },
          },
        },
      ] as Repository[],
    }),
  },
} as vscode.Extension<GitExtension>;

describe('Extension Test Suite', () => {
  let sandbox: SinonSandbox;
  vscode.window.showInformationMessage('Start all tests.');

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('Should throw error if Git extension is not available', async () => {
    sandbox.stub(vscode.extensions, 'getExtension').returns({
      exports: {},
    } as vscode.Extension<unknown>);

    assert.rejects(async () => {
      await copyCurrentBranchNameCommand();
    });
  });

  it('Should copy branch name to clipboard', async () => {
    sandbox.stub(vscode.extensions, 'getExtension').returns(mockGitExtension);

    await copyCurrentBranchNameCommand();
    const result = await vscode.env.clipboard.readText();
    assert.equal(result, testBranchName);
  });
});
