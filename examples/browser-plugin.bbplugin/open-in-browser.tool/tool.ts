/**
 * Open in Browser Tool for BB Tools Framework.
 * Provides functionality to open URLs or local files in web browsers.
 * Supports both system default and specific browsers.
 *
 * @example
 * ```ts
 * const tool = new LLMToolOpenInBrowser(
 *   'open_in_browser',
 *   'Open URLs in a web browser',
 *   {}
 * );
 *
 * await tool.runTool(interaction, {
 *   id: 'tool-1',
 *   name: 'open_in_browser',
 *   toolInput: {
 *     urls: ['https://example.com'],
 *     browser: 'chrome'
 *   }
 * }, projectEditor);
 * ```
 *
 * @module
 */

import LLMTool, {
  type IConversationInteraction,
  type IProjectEditor,
  type LLMAnswerToolUse,
  type LLMMessageContentPartTextBlock,
  type LLMToolInputSchema,
  type LLMToolLogEntryFormattedResult,
  type LLMToolRunResult,
} from 'jsr:@beyondbetter/tools';
import open, { apps } from 'npm:open@10.2.0';

import {
  formatLogEntryToolResult as formatLogEntryToolResultBrowser,
  formatLogEntryToolUse as formatLogEntryToolUseBrowser,
} from './formatter.browser.tsx';
import {
  formatLogEntryToolResult as formatLogEntryToolResultConsole,
  formatLogEntryToolUse as formatLogEntryToolUseConsole,
} from './formatter.console.ts';
import type { LLMToolOpenInBrowserInput, LLMToolOpenInBrowserResult } from './types.ts';

/**
 * Tool for opening URLs and local files in web browsers.
 * Supports multiple URLs, local file paths, and browser selection.
 *
 * Features:
 * - Open up to 6 URLs simultaneously
 * - Convert local file paths to file:// URLs
 * - Use system default or specific browsers
 * - Validate URLs and file paths
 * - Track success/failure per URL
 *
 * @example
 * ```ts
 * const browser = new LLMToolOpenInBrowser(
 *   'open_in_browser',
 *   'Open URLs in browser',
 *   {},
 *   { requiresNetwork: true }
 * );
 *
 * // Open multiple URLs in Firefox
 * await browser.runTool(interaction, {
 *   id: 'tool-1',
 *   name: 'open_in_browser',
 *   toolInput: {
 *     urls: ['https://example.com', 'src/docs/index.html'],
 *     browser: 'firefox'
 *   }
 * }, projectEditor);
 * ```
 */
export default class LLMToolOpenInBrowser extends LLMTool {
  /**
   * List of predefined browser identifiers.
   * These map to specific browser applications on the system.
   * @private
   */
  private readonly predefinedBrowsers = ['chrome', 'brave', 'firefox', 'edge', 'safari'] as const;
  /**
   * Maximum number of URLs that can be opened in one operation.
   * Limits batch operations to prevent resource exhaustion.
   * @private
   */
  private readonly maxUrls = 6;

  /**
   * JSON Schema for tool input validation.
   * Defines expected format for urls and browser selection.
   *
   * @example
   * ```ts
   * const input = {
   *   urls: ['https://example.com'],
   *   browser: 'chrome'
   * };
   * if (tool.validateInput(input)) {
   *   // Input is valid
   * }
   * ```
   */
  get inputSchema(): LLMToolInputSchema {
    return {
      type: 'object',
      properties: {
        urls: {
          type: 'array',
          items: { type: 'string' },
          description:
            `Array of URLs or file paths to open. Local paths will be converted to file:// URLs. Maximum of ${this.maxUrls} URLs allowed.`,
          maxItems: this.maxUrls,
        },
        browser: {
          type: 'string',
          description: `Browser to use. Can be one of the predefined browsers (${
            this.predefinedBrowsers.join(', ')
          }) or any other browser name. If not specified or "default", uses system default browser.`,
          default: 'default',
        },
      },
      required: ['urls'],
    };
  }

  formatLogEntryToolUse(
    toolInput: LLMToolInputSchema,
    format: 'console' | 'browser',
  ): LLMToolLogEntryFormattedResult {
    return format === 'console'
      ? formatLogEntryToolUseConsole(toolInput)
      : formatLogEntryToolUseBrowser(toolInput);
  }

  formatLogEntryToolResult(
    resultContent: LLMToolOpenInBrowserResult,
    format: 'console' | 'browser',
  ): LLMToolLogEntryFormattedResult {
    return format === 'console'
      ? formatLogEntryToolResultConsole(resultContent)
      : formatLogEntryToolResultBrowser(resultContent);
  }

  /**
   * Checks if a string is a valid URL.
   * Uses URL constructor for validation.
   *
   * @param urlString - String to validate as URL
   * @returns True if string is a valid URL
   * @private
   */
  private isValidUrl(urlString: string): boolean {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Opens a URL in the specified browser.
   * Maps browser names to system applications.
   *
   * @param url - URL to open
   * @param browser - Browser to use (default='default')
   * @returns Promise resolving to success message
   * @throws Error if URL cannot be opened
   * @private
   */
  private async openUrl(url: string, browser = 'default'): Promise<string> {
    try {
      const useBrowser = browser === 'default'
        ? apps.browser
        : browser === 'chrome'
        ? apps.chrome
        : browser === 'brave'
        ? apps.brave
        : browser === 'firefox'
        ? apps.firefox
        : browser === 'edge'
        ? apps.edge
        : browser;

      // console.log('OpenInBrowserTool: open URL: ', { url, browser });
      await open(url, { app: { name: useBrowser } });

      return `Successfully sent command to open ${url} in ${useBrowser}`;
    } catch (error) {
      throw new Error(`Failed to open URL ${url}: ${(error as Error).message}`);
    }
  }

  /**
   * Resolves a local file path to a file:// URL.
   * Validates path is within project and exists.
   *
   * @param projectEditor - Project editor instance
   * @param path - Local file path to resolve
   * @returns Promise resolving to file:// URL
   * @throws Error if path is invalid or file doesn't exist
   * @private
   */
  private async resolveLocalPath(projectEditor: IProjectEditor, path: string): Promise<string> {
    // Check if path is within project
    if (!projectEditor.isPathWithinProject(path)) {
      throw new Error(`Path ${path} is outside project root`);
    }

    // Convert to absolute path and check existence
    const absolutePath = await projectEditor.resolveProjectFilePath(path);
    try {
      await Deno.stat(absolutePath);
    } catch {
      throw new Error(`File ${path} does not exist`);
    }

    // Convert to file:// URL
    return `file://${absolutePath}`;
  }

  /**
   * Executes the tool to open URLs in browser.
   * Handles both web URLs and local file paths.
   *
   * @param _interaction - Conversation interaction context (unused)
   * @param toolUse - Current tool use information
   * @param projectEditor - Project editor for resolving paths
   * @returns Promise resolving to tool execution results
   * @throws Error if too many URLs provided
   */
  async runTool(
    _interaction: IConversationInteraction,
    toolUse: LLMAnswerToolUse,
    projectEditor: IProjectEditor,
  ): Promise<LLMToolRunResult> {
    const input = toolUse.toolInput as unknown as LLMToolOpenInBrowserInput;
    const { urls, browser = 'default' } = input;
    // console.log('OpenInBrowserTool: ', { urls, browser });
    if (urls.length > this.maxUrls) {
      throw new Error(`Too many URLs provided. Maximum allowed is ${this.maxUrls}`);
    }

    const toolResultContentParts: LLMMessageContentPartTextBlock[] = [];
    const opensSuccess: Array<{ result: string }> = [];
    const opensError: Array<{ url: string; error: string }> = [];

    for (const url of urls) {
      try {
        // If it's not a valid URL, try treating it as a local file path
        const finalUrl = this.isValidUrl(url)
          ? url
          : await this.resolveLocalPath(projectEditor, url);
        const result = await this.openUrl(finalUrl, browser);
        toolResultContentParts.push({
          'type': 'text',
          'text': `${result}`,
        });
        opensSuccess.push({ result });
      } catch (error) {
        toolResultContentParts.push({
          'type': 'text',
          'text': `Error opening URL ${url} - ${(error as Error).message}`,
        });
        opensError.push({ url, error: (error as Error).message });
      }
    }

    const toolResults = toolResultContentParts;

    const toolResponse = opensError.length === 0
      ? `Successfully opened ${urls.length} URL(s) in ${
        browser === 'default' ? 'default browser' : browser
      }`
      : `Encountered ${opensError.length} error(s) while opening URLs. Check tool results for details.`;

    const bbResponse = {
      data: {
        opensSuccess: opensSuccess.map((r) => r.result),
        opensError: opensError.map((r) => `${r.url} could not be opened - ${r.error}`),
      },
    };

    return { toolResults, toolResponse, bbResponse };
  }
}
