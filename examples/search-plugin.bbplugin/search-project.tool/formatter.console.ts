/**
 * Console destination formatter for the Search Project tool.
 * Formats search criteria and results for console-based environments.
 * Creates structured text output with ANSI colors and formatting.
 *
 * Features:
 * - Search parameter formatting
 * - File path representation
 * - Error state handling
 * - Success/failure indicators
 * - Hierarchical output structure
 * - Size and date formatting
 *
 * @module
 */

import { stripIndents } from 'common-tags';
import LLMTool, {
  type LLMToolInputSchema,
  type LLMToolLogEntryFormattedResult,
} from '@beyondbetter/tools';
import type { SearchProjectInput } from './tool.ts';

/**
 * Formats search input for console destination.
 * Creates text-based representation of search parameters.
 *
 * @param toolInput - Validated search parameters
 * @returns Formatted result for console display
 *
 * @example
 * ```ts
 * const formatted = formatLogEntryToolUse({
 *   contentPattern: 'export',
 *   filePattern: '**\/*.ts',
 *   dateAfter: '2024-01-01'
 * });
 * // Returns:
 * // Tool Use: Search Project
 * // Searching project files...
 * // Search Parameters:
 * // • Content pattern: export (case-insensitive)
 * // • File pattern: **\/*.ts
 * // • Modified after: 2024-01-01
 * ```
 */
export function formatLogEntryToolUse(
  toolInput: LLMToolInputSchema,
): LLMToolLogEntryFormattedResult {
  const input = toolInput as SearchProjectInput;
  const {
    contentPattern,
    caseSensitive,
    filePattern,
    dateAfter,
    dateBefore,
    sizeMin,
    sizeMax,
  } = input;

  const criteria = [];
  if (contentPattern) {
    criteria.push(stripIndents`
      ${LLMTool.TOOL_STYLES_CONSOLE.base.label('Content pattern:')} 
      ${LLMTool.TOOL_STYLES_CONSOLE.content.regex(contentPattern)}, 
      ${
      LLMTool.TOOL_STYLES_CONSOLE.content.boolean(
        caseSensitive ?? false,
        'case-sensitive/case-insensitive',
      )
    }`);
  }
  if (filePattern) {
    criteria.push(stripIndents`
      ${LLMTool.TOOL_STYLES_CONSOLE.base.label('File pattern:')} 
      ${LLMTool.TOOL_STYLES_CONSOLE.content.filename(filePattern)}`);
  }
  if (dateAfter) {
    criteria.push(stripIndents`
      ${LLMTool.TOOL_STYLES_CONSOLE.base.label('Modified after:')} 
      ${LLMTool.TOOL_STYLES_CONSOLE.content.date(dateAfter)}`);
  }
  if (dateBefore) {
    criteria.push(stripIndents`
      ${LLMTool.TOOL_STYLES_CONSOLE.base.label('Modified before:')} 
      ${LLMTool.TOOL_STYLES_CONSOLE.content.date(dateBefore)}`);
  }
  if (sizeMin !== undefined) {
    criteria.push(stripIndents`
      ${LLMTool.TOOL_STYLES_CONSOLE.base.label('Minimum size:')} 
      ${LLMTool.TOOL_STYLES_CONSOLE.content.size(sizeMin)}`);
  }
  if (sizeMax !== undefined) {
    criteria.push(stripIndents`
      ${LLMTool.TOOL_STYLES_CONSOLE.base.label('Maximum size:')} 
      ${LLMTool.TOOL_STYLES_CONSOLE.content.size(sizeMax)}`);
  }

  return {
    title: LLMTool.TOOL_STYLES_CONSOLE.content.title('Tool Use', 'Search Project'),
    subtitle: LLMTool.TOOL_STYLES_CONSOLE.content.subtitle('Searching project files...'),
    content: stripIndents`
      ${LLMTool.TOOL_STYLES_CONSOLE.base.label('Search Parameters')}
      ${criteria.map((c) => LLMTool.TOOL_STYLES_CONSOLE.base.listItem(c)).join('\n')}`,
    preview: 'Searching project files with specified criteria',
  };
}

/**
 * Formats search results for console destination.
 * Creates text output showing matched files and errors.
 *
 * @param resultContent - Raw search results
 * @returns Formatted result for console display
 *
 * @example
 * ```ts
 * const formatted = formatLogEntryToolResult(
 *   'Found 3 files matching criteria:\n' +
 *   '<files>\n' +
 *   'src/config.ts\n' +
 *   'src/types.ts\n' +
 *   'src/utils.ts\n' +
 *   '</files>'
 * );
 * // Returns:
 * // Tool Result: Search Project
 * // Search completed successfully
 * // Files Found:
 * // • src/config.ts
 * // • src/types.ts
 * // • src/utils.ts
 * ```
 */
export function formatLogEntryToolResult(
  resultContent: unknown,
): LLMToolLogEntryFormattedResult {
  const content = resultContent as string;
  const lines = content.split('\n');
  const fileList = lines.slice(
    lines.findIndex((line) => line.includes('<files>')) + 1,
    lines.findIndex((line) => line.includes('</files>')),
  );

  const hasErrors = content.includes('Error:');
  const errorLines = hasErrors ? lines.filter((line) => line.startsWith('Error:')) : [];

  return {
    title: LLMTool.TOOL_STYLES_CONSOLE.content.title('Tool Result', 'Search Project'),
    subtitle: LLMTool.TOOL_STYLES_CONSOLE.content.subtitle(
      hasErrors ? 'Search completed with errors' : 'Search completed successfully',
    ),
    content: stripIndents`
      ${
      hasErrors
        ? stripIndents`
        ${LLMTool.TOOL_STYLES_CONSOLE.status.error('Errors')}
        ${
          errorLines.map((error) =>
            LLMTool.TOOL_STYLES_CONSOLE.base.listItem(
              LLMTool.TOOL_STYLES_CONSOLE.status.error(error),
            )
          ).join('\n')
        }`
        : stripIndents`
        ${LLMTool.TOOL_STYLES_CONSOLE.status.success('Files Found')}
        ${
          fileList.map((file) =>
            LLMTool.TOOL_STYLES_CONSOLE.base.listItem(
              LLMTool.TOOL_STYLES_CONSOLE.content.filename(file),
            )
          ).join('\n')
        }`
    }`,
    preview: hasErrors
      ? `Search completed with ${errorLines.length} error(s)`
      : `Found ${fileList.length} files`,
  };
}
