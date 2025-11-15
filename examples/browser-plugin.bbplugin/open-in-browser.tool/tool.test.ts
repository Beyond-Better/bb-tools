/**
 * Tests for the Open in Browser tool.
 * Verifies URL handling, browser selection, error cases, and output formatting.
 *
 * Test Coverage:
 * - URL validation and handling
 * - Local file path resolution
 * - Browser selection and customization
 * - Error handling and validation
 * - Output formatting for browser and console
 *
 * @module
 */

import {
  assertEquals,
  assertRejects,
  assertStringIncludes,
} from 'https://deno.land/std@0.217.0/assert/mod.ts';
import { assertSpyCalls, spy } from 'https://deno.land/std@0.217.0/testing/mock.ts';
import { withTestProject } from 'jsr:@beyondbetter/tools/testing';
import OpenInBrowserTool from './tool.ts';
import type { IConversationInteraction, LLMAnswerToolUse } from 'jsr:@beyondbetter/tools';

/**
 * Mock implementation of IConversationInteraction.
 * Provides minimal implementation for testing.
 */

const mockInteraction: IConversationInteraction = {
  getFileMetadata: () => ({ type: 'text', size: 100, last_modified: new Date().toISOString() }),
  readProjectFileContent: async () => 'test content',
};

/**
 * Creates mock tool use objects for testing.
 * Generates consistent test data with configurable URLs and browser.
 *
 * @param urls - Array of URLs or file paths to open
 * @param browser - Optional browser selection
 * @returns Mock tool use object
 */

function createToolUse(urls: string[], browser = 'default'): LLMAnswerToolUse {
  return {
    id: 'test-id',
    name: 'open-in-browser',
    toolInput: { urls, browser },
  };
}

/**
 * Tests URL validation functionality.
 * Verifies handling of web URLs and file URLs.
 */
Deno.test({
  name: 'OpenInBrowserTool - validates URLs correctly',
  async fn() {
    await withTestProject(async (projectEditor) => {
      const tool = new OpenInBrowserTool();
      const originalCommand = Deno.Command;

      try {
        // Mock Deno.Command
        (Deno as any).Command = function (cmd: string, options: any) {
          return {
            output: async () => ({ code: 0 }),
          };
        };

        // Test valid URL
        const validResult = await tool.runTool(
          mockInteraction,
          createToolUse(['https://example.com']),
          projectEditor,
        );
        assertStringIncludes(validResult.toolResults, 'Successfully sent command');

        // Test valid file URL
        const fileResult = await tool.runTool(
          mockInteraction,
          createToolUse(['file:///path/to/file.html']),
          projectEditor,
        );
        assertStringIncludes(fileResult.toolResults, 'Successfully sent command');
      } finally {
        // Restore original Deno.Command
        (Deno as any).Command = originalCommand;
      }
    });
  },
});

/**
 * Tests local file path handling.
 * Verifies conversion of project paths to file:// URLs.
 */
Deno.test({
  name: 'OpenInBrowserTool - handles local file paths',
  async fn() {
    await withTestProject(async (projectEditor) => {
      const tool = new OpenInBrowserTool();
      const originalCommand = Deno.Command;
      const commandSpy = spy((cmd: string, options: any) => ({
        output: async () => ({ code: 0 }),
      }));

      try {
        // Create a test file
        const testFile = 'test.html';
        await Deno.writeTextFile(
          projectEditor.resolveProjectPath(testFile),
          '<html>Test</html>',
        );

        // Mock Deno.Command
        (Deno as any).Command = commandSpy;

        // Test opening local file
        const result = await tool.runTool(
          mockInteraction,
          createToolUse([testFile]),
          projectEditor,
        );

        assertStringIncludes(result.toolResults, 'Successfully sent command');
        assertSpyCalls(commandSpy, 1);
      } finally {
        // Restore original Deno.Command
        (Deno as any).Command = originalCommand;
      }
    });
  },
});

/**
 * Tests browser selection functionality.
 * Verifies default, specific, and custom browser handling.
 */
Deno.test({
  name: 'OpenInBrowserTool - handles browser selection',
  async fn() {
    await withTestProject(async (projectEditor) => {
      const tool = new OpenInBrowserTool();
      const originalCommand = Deno.Command;
      const commandSpy = spy((cmd: string, options: any) => ({
        output: async () => ({ code: 0 }),
      }));

      try {
        // Mock Deno.Command
        (Deno as any).Command = commandSpy;

        // Test with default browser
        await tool.runTool(
          mockInteraction,
          createToolUse(['https://example.com']),
          projectEditor,
        );

        // Test with specific browser
        await tool.runTool(
          mockInteraction,
          createToolUse(['https://example.com'], 'firefox'),
          projectEditor,
        );

        // Test with custom browser
        await tool.runTool(
          mockInteraction,
          createToolUse(['https://example.com'], 'custom-browser'),
          projectEditor,
        );

        assertSpyCalls(commandSpy, 3);
      } finally {
        // Restore original Deno.Command
        (Deno as any).Command = originalCommand;
      }
    });
  },
});

/**
 * Tests error handling scenarios.
 * Verifies URL limits, invalid paths, and security boundaries.
 */
Deno.test({
  name: 'OpenInBrowserTool - handles errors correctly',
  async fn() {
    await withTestProject(async (projectEditor) => {
      const tool = new OpenInBrowserTool();

      // Test too many URLs
      await assertRejects(
        () =>
          tool.runTool(
            mockInteraction,
            createToolUse([
              'url1',
              'url2',
              'url3',
              'url4',
              'url5',
              'url6',
              'url7',
            ]),
            projectEditor,
          ),
        Error,
        'Too many URLs',
      );

      // Test invalid file path
      await assertRejects(
        () =>
          tool.runTool(
            mockInteraction,
            createToolUse(['nonexistent.html']),
            projectEditor,
          ),
        Error,
        'does not exist',
      );

      // Test path outside project
      await assertRejects(
        () =>
          tool.runTool(
            mockInteraction,
            createToolUse(['../outside.html']),
            projectEditor,
          ),
        Error,
        'outside project root',
      );
    });
  },
});

/**
 * Tests browser output formatting.
 * Verifies JSX element generation for single and multiple URLs.
 */
Deno.test({
  name: 'OpenInBrowserTool - formats browser output correctly',
  fn() {
    const tool = new OpenInBrowserTool();

    // Test browser formatter with single URL
    const singleResult = tool.formatLogEntryToolUse(
      { urls: ['https://example.com'] },
      'browser',
    );
    assertEquals(typeof singleResult, 'object');

    // Test browser formatter with multiple URLs and custom browser
    const multiResult = tool.formatLogEntryToolUse(
      {
        urls: ['https://example.com', 'file.html'],
        browser: 'firefox',
      },
      'browser',
    );
    assertEquals(typeof multiResult, 'object');
  },
});

/**
 * Tests console output formatting.
 * Verifies text formatting with ANSI colors for single and multiple URLs.
 */
Deno.test({
  name: 'OpenInBrowserTool - formats console output correctly',
  fn() {
    const tool = new OpenInBrowserTool();

    // Test console formatter with single URL
    const singleResult = tool.formatLogEntryToolUse(
      { urls: ['https://example.com'] },
      'console',
    );
    assertStringIncludes(singleResult, 'https://example.com');

    // Test console formatter with multiple URLs and custom browser
    const multiResult = tool.formatLogEntryToolUse(
      {
        urls: ['https://example.com', 'file.html'],
        browser: 'firefox',
      },
      'console',
    );
    assertStringIncludes(multiResult, 'https://example.com');
    assertStringIncludes(multiResult, 'file.html');
    assertStringIncludes(multiResult, 'firefox');
  },
});
