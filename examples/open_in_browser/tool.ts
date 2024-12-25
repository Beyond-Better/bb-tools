import LLMTool, {
  type IConversationInteraction,
  type IProjectEditor,
  type LLMToolInputSchema,
  type LLMToolLogEntryFormattedResult,
  type LLMToolRunResult,
  type LLMAnswerToolUse
} from '@beyondbetter/tools';

import {
  formatLogEntryToolResult as formatLogEntryToolResultBrowser,
  formatLogEntryToolUse as formatLogEntryToolUseBrowser,
} from './formatter.browser.tsx';
import {
  formatLogEntryToolResult as formatLogEntryToolResultConsole,
  formatLogEntryToolUse as formatLogEntryToolUseConsole,
} from './formatter.console.ts';

export interface OpenInBrowserInput {
  urls: string[];
  browser?: string;
}

export default class OpenInBrowserTool extends LLMTool {
  private readonly predefinedBrowsers = ['chrome', 'firefox', 'edge', 'safari'] as const;
  private readonly maxUrls = 6;

  get inputSchema(): LLMToolInputSchema {
    return {
      type: 'object',
      properties: {
        urls: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of URLs or file paths to open. Local paths will be converted to file:// URLs. Maximum of 6 URLs allowed.',
          maxItems: this.maxUrls
        },
        browser: {
          type: 'string',
          description: 'Browser to use. Can be one of the predefined browsers (chrome, firefox, edge, safari) or any other browser name. If not specified or "default", uses system default browser.',
          default: 'default'
        }
      },
      required: ['urls']
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
    resultContent: unknown,
    format: 'console' | 'browser',
  ): LLMToolLogEntryFormattedResult {
    return format === 'console'
      ? formatLogEntryToolResultConsole(resultContent)
      : formatLogEntryToolResultBrowser(resultContent);
  }

  private isValidUrl(urlString: string): boolean {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  }

  private async openUrl(url: string, browser = 'default'): Promise<string> {
    try {
      let command;
      if (Deno.build.os === 'windows') {
        // Escape & with ^ for Windows command prompt
        const escapedUrl = url.replace(/&/g, '^&');
        if (browser === 'default') {
          command = new Deno.Command('cmd', { args: ['/c', 'start', escapedUrl] });
        } else {
          command = new Deno.Command('cmd', { args: ['/c', 'start', browser, escapedUrl] });
        }
      } else if (Deno.build.os === 'darwin') {
        if (browser === 'default') {
          command = new Deno.Command('open', { args: [url] });
        } else {
          command = new Deno.Command('open', { args: ['-a', browser, url] });
        }
      } else {
        // Linux
        if (browser === 'default') {
          command = new Deno.Command('xdg-open', { args: [url] });
        } else {
          command = new Deno.Command(browser, { args: [url] });
        }
      }
      await command.output();
      return `Successfully sent command to open ${url}${browser === 'default' ? '' : ` in ${browser}`}`;
    } catch (error) {
      throw new Error(`Failed to open URL ${url}: ${error.message}`);
    }
  }

  private async resolveLocalPath(projectEditor: IProjectEditor, path: string): Promise<string> {
    // Check if path is within project
    if (!projectEditor.isPathWithinProject(path)) {
      throw new Error(`Path ${path} is outside project root`);
    }

    // Convert to absolute path and check existence
    const absolutePath = projectEditor.resolveProjectPath(path);
    try {
      await Deno.stat(absolutePath);
    } catch {
      throw new Error(`File ${path} does not exist`);
    }

    // Convert to file:// URL
    return `file://${absolutePath}`;
  }

  async runTool(
    _interaction: IConversationInteraction,
    toolUse: LLMAnswerToolUse,
    projectEditor: IProjectEditor,
  ): Promise<LLMToolRunResult> {
    const input = toolUse.toolInput as OpenInBrowserInput;
    const { urls, browser = 'default' } = input;

    if (urls.length > this.maxUrls) {
      throw new Error(`Too many URLs provided. Maximum allowed is ${this.maxUrls}`);
    }

    const results: string[] = [];
    const errors: string[] = [];

    for (const url of urls) {
      try {
        // If it's not a valid URL, try treating it as a local file path
        const finalUrl = this.isValidUrl(url) ? url : await this.resolveLocalPath(projectEditor, url);
        const result = await this.openUrl(finalUrl, browser);
        results.push(result);
      } catch (error) {
        errors.push(error.message);
      }
    }

    const toolResults = [
      ...results,
      ...(errors.length > 0 ? [`\nErrors encountered:`, ...errors] : [])
    ].join('\n');

    const toolResponse = errors.length === 0
      ? `Successfully opened ${urls.length} URL(s)${browser === 'default' ? '' : ` in ${browser}`}`
      : `Encountered ${errors.length} error(s) while opening URLs. Check tool results for details.`;

    const bbResponse = errors.length === 0
      ? `BB has opened ${urls.length} URL(s)${browser === 'default' ? '' : ` in ${browser}`}`
      : `BB encountered ${errors.length} error(s) while opening URLs. Please check the results for details.`;

    return { toolResults, toolResponse, bbResponse };
  }
}