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
import { sleep } from 'bun';
import * as vscode from 'vscode';
import { showStatusBarButton, showToastInStatusBar } from './statusbar';

describe('statusbar', () => {
  let createStatusBarItemMock: Mock<() => Partial<vscode.StatusBarItem>>;

  beforeEach(() => {
    createStatusBarItemMock = mock(() => ({
      show: mock(),
    }));
    mock.module('vscode', () => ({
      window: {
        createStatusBarItem: createStatusBarItemMock,
        setStatusBarMessage: mock(),
      },
    }));
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('showStatusBarButton', () => {
    it('should create and show a status bar button with the given config', () => {
      const mockStatusBarItem: Partial<vscode.StatusBarItem> = {
        show: mock(),
      };
      createStatusBarItemMock.mockReturnValue(mockStatusBarItem);
      const config = {
        alignment: vscode.StatusBarAlignment.Left,
        priority: 1,
        text: 'Test Button',
        tooltip: 'Test Tooltip',
        accessibilityInformation: 'Test Accessibility',
        command: 'test.command',
        visible: true,
      };

      showStatusBarButton(config);

      expect(createStatusBarItemMock).toHaveBeenCalledWith(
        config.alignment,
        config.priority
      );
      expect(mockStatusBarItem.text).toBe(config.text);
      expect(mockStatusBarItem.tooltip).toBe(config.tooltip);
      expect(mockStatusBarItem.accessibilityInformation).toEqual({
        label: config.accessibilityInformation,
      });
      expect(mockStatusBarItem.command).toBe(config.command);
      expect(mockStatusBarItem.show).toHaveBeenCalled();
    });
  });

  describe('showToastInStatusBar', () => {
    it('should show a message in the status bar for a short time', async () => {
      const message = 'Test Message';
      const milliseconds = 1;

      showToastInStatusBar(message, milliseconds);

      console.log(vscode.window);

      expect(vscode.window.setStatusBarMessage).toHaveBeenCalledWith(message);
      await sleep(milliseconds);
      expect(vscode.window.setStatusBarMessage).toHaveBeenCalledTimes(2);
      expect(vscode.window.setStatusBarMessage).toHaveBeenLastCalledWith('');
    });
  });
});
