/**
 * Console destination formatter for the Open in Browser tool.
 * Formats tool input and results for console-based environments.
 * Uses ANSI colors and text formatting for structured output.
 *
 * Features:
 * - Text-based representation of URLs
 * - Browser selection formatting
 * - Success/failure status indicators
 * - Color-coded output sections
 *
 * @module
 */

import { stripIndents } from 'common-tags';
import LLMTool, {
  type LLMToolInputSchema,
  type LLMToolLogEntryFormattedResult,
} from 'jsr:@beyondbetter/tools';
import type { LLMToolOpenInBrowserInput, LLMToolOpenInBrowserResult } from './types.ts';

/**
 * Formats tool input for console destination.
 * Creates text-based representation of URLs and browser selection.
 *
 * @param toolInput - Validated tool input parameters
 * @returns Formatted result for console display
 *
 * @example
 * ```ts
 * const formatted = formatLogEntryToolUse({
 *   urls: ['https://example.com'],
 *   browser: 'chrome'
 * });
 * // Returns:
 * // Tool Use: Open in Browser
 * // Opening URLs in browser...
 * // URLs to Open:
 * // • https://example.com
 * // Using Browser: chrome
 * ```
 */
export function formatLogEntryToolUse(
  toolInput: LLMToolInputSchema,
): LLMToolLogEntryFormattedResult {
  const { urls, browser = 'default' } = toolInput as LLMToolOpenInBrowserInput;

  return {
    title: LLMTool.TOOL_STYLES_CONSOLE.content.title('Tool Use', 'Open in Browser'),
    subtitle: LLMTool.TOOL_STYLES_CONSOLE.content.subtitle('Opening URLs in browser...'),
    content: stripIndents`
      ${LLMTool.TOOL_STYLES_CONSOLE.base.label('URLs to Open')}
      ${
      urls.map((url) =>
        LLMTool.TOOL_STYLES_CONSOLE.base.listItem(
          LLMTool.TOOL_STYLES_CONSOLE.content.url(url),
        )
      ).join('\n')
    }
      Using Browser: ${browser}`,
    preview: `Opening ${urls.length} URL(s) in ${
      browser !== 'default' ? browser : 'default browser'
    }`,
  };
}

/**
 * Formats tool results for console destination.
 * Creates text output showing operation outcomes with ANSI colors.
 *
 * @param resultContent - Results from tool execution
 * @returns Formatted result for console display
 *
 * @example
 * ```ts
 * const formatted = formatLogEntryToolResult({
 *   toolResult: { /* ... */ },
 *   bbResponse: {
 *     data: {
 *       opensSuccess: ['URL opened successfully'],
 *       opensError: []
 *     }
 *   }
 * });
 * // Returns:
 * // Tool Result: Open in Browser
 * // 1 opened
 * // URLs Opened:
 * // URL opened successfully
 * ```
 */
export const formatLogEntryToolResult = (
  resultContent: LLMToolOpenInBrowserResult,
): LLMToolLogEntryFormattedResult => {
  const { bbResponse } = resultContent;

  if (typeof bbResponse === 'object' && 'data' in bbResponse) {
    const { data } = bbResponse as LLMToolOpenInBrowserResult['bbResponse'];

    const contentParts = [];

    if (data.opensSuccess.length > 0) {
      contentParts.push(stripIndents`
                ${LLMTool.TOOL_STYLES_CONSOLE.content.status.completed('URLs Opened:')}
                ${data.opensSuccess.map((result) => result).join('\n')}
            `);
    }

    if (data.opensError.length > 0) {
      contentParts.push(stripIndents`
                ${LLMTool.TOOL_STYLES_CONSOLE.content.status.failed('Failed to Open:')}
                ${data.opensError.map((result) => result).join('\n')}
            `);
    }

    const content = contentParts.join('\n\n');
    const openedCount = data.opensSuccess.length;
    const errorCount = data.opensError.length;
    const subtitle = `${openedCount} opened${errorCount > 0 ? `, ${errorCount} failed` : ''}`;

    return {
      title: LLMTool.TOOL_STYLES_CONSOLE.content.title('Tool Result', 'Open in Browser'),
      subtitle: LLMTool.TOOL_STYLES_CONSOLE.content.subtitle(subtitle),
      content,
      preview: openedCount > 0
        ? `Opened ${openedCount} URL${openedCount === 1 ? '' : 's'}`
        : 'No URLs opened',
    };
  } else {
    console.error('LLMToolOpenInBrowser: Unexpected bbResponse format:', bbResponse);
    return {
      title: LLMTool.TOOL_STYLES_CONSOLE.content.title('Tool Result', 'Open in Browser'),
      subtitle: LLMTool.TOOL_STYLES_CONSOLE.content.subtitle('Error'),
      content: LLMTool.TOOL_STYLES_CONSOLE.content.status.failed(String(bbResponse)),
      preview: 'Error opening URLs',
    };
  }
};
