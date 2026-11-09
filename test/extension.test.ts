import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import { buildSync } from 'esbuild';
import type { GitRepository } from '../src/types/git.js';

type Repository = Omit<GitRepository, 'rootUri'> & {
  rootUri: { path: string };
};
type Disposable = { disposed: boolean; dispose(): void };
type PickItem = { label: string; description: string; repository: Repository };
type Calls = {
  copied: string[];
  errors: string[];
  information: string[];
  messages: (Disposable & { message: string; milliseconds: number })[];
  picks: PickItem[][];
  command?: string;
  activated?: boolean;
};

// Bundle the real extension, replacing only the VS Code runtime API.
const code = buildSync({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  external: ['vscode'],
  write: false,
}).outputFiles[0].text;

const repository = (name = 'main', root = '/project'): Repository => ({
  rootUri: { path: root },
  state: { HEAD: { name } },
});

const fixture = (repositories: Repository[] = [repository()]) => {
  const calls: Calls = { copied: [], errors: [], information: [], messages: [], picks: [] };
  const disposable = (): Disposable => ({ disposed: false, dispose() { this.disposed = true; } });
  const button = { ...disposable(), command: '', shown: false, show() { this.shown = true; } };
  const commandDisposable = disposable();
  let callback: () => Promise<void> = async () => { throw new Error('Command not registered'); };
  const api = { repositories, getRepository: (_uri: { path: string }): Repository | null => null };
  const vscode = {
    Disposable: class {
      dispose: () => void;
      constructor(dispose: () => void) { this.dispose = dispose; }
    },
    StatusBarAlignment: { Left: 1 },
    commands: {
      registerCommand(id: string, handler: () => Promise<void>) {
        calls.command = id;
        callback = handler;
        return commandDisposable;
      },
    },
    extensions: {
      getExtension(id: string): { activate(): Promise<{ getAPI(): typeof api }> } | undefined {
        assert.equal(id, 'vscode.git');
        return { async activate() { calls.activated = true; return { getAPI: () => api }; } };
      },
    },
    workspace: { getWorkspaceFolder: (_uri: { path: string }): { name: string } | undefined => undefined },
    window: {
      activeTextEditor: undefined as { document: { uri: { path: string } } } | undefined,
      createStatusBarItem: () => button,
      setStatusBarMessage(message: string, milliseconds: number) {
        const item = { message, milliseconds, ...disposable() };
        calls.messages.push(item);
        return item;
      },
      showErrorMessage: async (message: string) => { calls.errors.push(message); },
      showInformationMessage: async (message: string) => { calls.information.push(message); },
      showQuickPick: async (items: PickItem[]): Promise<PickItem | undefined> => { calls.picks.push(items); return undefined; },
    },
    env: { clipboard: { writeText: async (text: string) => { calls.copied.push(text); } } },
  };
  const context = { extension: { packageJSON: { name: 'copy-branch-name' } }, subscriptions: [] as { dispose(): void }[] };
  const compiled = { exports: {} as { activate(extensionContext: typeof context): void } };
  vm.runInNewContext(code, {
    module: compiled,
    exports: compiled.exports,
    require(id: string) {
      assert.equal(id, 'vscode');
      return vscode;
    },
    Error,
  }, { filename: 'extension.cjs' });
  compiled.exports.activate(context);
  return { calls, vscode, api, button, context, commandDisposable, run: () => callback() };
};

test('registers one command and disposes the button and toast on deactivation', async () => {
  const f = fixture();
  assert.equal(f.calls.command, 'copy-branch-name.copy-current');
  assert.equal(f.button.command, f.calls.command);
  assert.equal(f.button.shown, true);
  await f.run();
  for (const item of f.context.subscriptions) item.dispose();
  assert.equal(f.button.disposed, true);
  assert.equal(f.commandDisposable.disposed, true);
  assert.equal(f.calls.messages[0].disposed, true);
});

test('activates Git and copies the only repository branch without a picker', async () => {
  const f = fixture();
  await f.run();
  assert.equal(f.calls.activated, true);
  assert.deepEqual(f.calls.copied, ['main']);
  assert.deepEqual(f.calls.picks, []);
  assert.equal(f.calls.messages[0].milliseconds, 5000);
});

test('prefers the repository containing the active file', async () => {
  const active = repository('feature', '/other');
  const f = fixture([repository(), active]);
  const uri = { path: '/other/file.ts' };
  f.vscode.window.activeTextEditor = { document: { uri } };
  f.api.getRepository = (received) => { assert.equal(received, uri); return active; };
  await f.run();
  assert.deepEqual(f.calls.copied, ['feature']);
  assert.deepEqual(f.calls.picks, []);
});

test('falls back to the only repository when the active file is outside Git', async () => {
  const f = fixture();
  f.vscode.window.activeTextEditor = { document: { uri: { path: '/outside.txt' } } };
  await f.run();
  assert.deepEqual(f.calls.copied, ['main']);
});

test('selects from multiple repositories with workspace names and URI fallbacks', async () => {
  const f = fixture([repository(), repository('feature', '/remote/other/')]);
  f.vscode.workspace.getWorkspaceFolder = (uri) => uri.path === '/project' ? { name: 'Workspace' } : undefined;
  f.vscode.window.showQuickPick = async (items) => {
    assert.deepEqual(Array.from(items, ({ label }) => label), ['Workspace (main)', 'other (feature)']);
    assert.equal(items[1].description, '/remote/other/');
    return items[1];
  };
  await f.run();
  assert.deepEqual(f.calls.copied, ['feature']);
});

test('cancelling the picker is silent', async () => {
  const f = fixture([repository(), repository('other')]);
  await f.run();
  assert.equal(f.calls.picks.length, 1);
  assert.deepEqual(f.calls.copied, []);
  assert.deepEqual(f.calls.errors, []);
  assert.deepEqual(f.calls.information, []);
});

test('reports an empty workspace without writing to the clipboard', async () => {
  const f = fixture([]);
  await f.run();
  assert.equal(f.calls.errors.length, 1);
  assert.deepEqual(f.calls.copied, []);
});

test('reports an unavailable Git extension', async () => {
  const f = fixture();
  f.vscode.extensions.getExtension = () => undefined;
  await f.run();
  assert.equal(f.calls.errors.length, 1);
  assert.deepEqual(f.calls.copied, []);
});

for (const HEAD of [undefined, {}, { name: '' }]) {
  test(`does not copy an empty branch for HEAD=${JSON.stringify(HEAD)}`, async () => {
    const f = fixture([{ rootUri: { path: '/project' }, state: { HEAD } }]);
    await f.run();
    assert.equal(f.calls.information.length, 1);
    assert.deepEqual(f.calls.copied, []);
    assert.deepEqual(f.calls.messages, []);
  });
}

test('handles clipboard errors without throwing or showing a success toast', async () => {
  const f = fixture();
  f.vscode.env.clipboard.writeText = async () => { throw new Error('Permission denied'); };
  await f.run();
  assert.match(f.calls.errors[0], /Permission denied/);
  assert.deepEqual(f.calls.messages, []);
});

test('handles Git activation failures without an unhandled rejection', async () => {
  const f = fixture();
  f.vscode.extensions.getExtension = () => ({ activate: async () => { throw new Error('Git unavailable'); } });
  await f.run();
  assert.match(f.calls.errors[0], /Git unavailable/);
});

test('replaces the previous toast using VS Code disposables', async () => {
  const f = fixture();
  await f.run();
  await f.run();
  assert.equal(f.calls.messages.length, 2);
  assert.equal(f.calls.messages[0].disposed, true);
  assert.equal(f.calls.messages[1].disposed, false);
});
