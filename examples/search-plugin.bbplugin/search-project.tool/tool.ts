/**
 * Search Project Tool for BB Tools Framework.
 * Provides functionality to search project files by content pattern (grep),
 * file name pattern (glob), modification date, and file size.
 *
 * Features:
 * - Content search with regex support
 * - File name pattern matching with globs
 * - Date range filtering
 * - File size filtering
 * - Case sensitivity control
 *
 * @example
 * ```ts
 * const tool = new SearchProjectTool(
 *   'search_project',
 *   'Search project files',
 *   {}
 * );
 *
 * // Search TypeScript files modified in 2024
 * await tool.runTool(interaction, {
 *   id: 'tool-1',
 *   name: 'search_project',
 *   toolInput: {
 *     filePattern: '**\/*.ts',
 *     dateAfter: '2024-01-01',
 *     dateBefore: '2024-12-31'
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
  type LLMToolInputSchema,
  type LLMToolLogEntryFormattedResult,
  type LLMToolRunResult,
} from '@beyondbetter/tools';

import {
  formatLogEntryToolResult as formatLogEntryToolResultBrowser,
  formatLogEntryToolUse as formatLogEntryToolUseBrowser,
} from './formatter.browser.tsx';
import {
  formatLogEntryToolResult as formatLogEntryToolResultConsole,
  formatLogEntryToolUse as formatLogEntryToolUseConsole,
} from './formatter.console.ts';

/**
 * Input parameters for project search operations.
 * Supports multiple search criteria that can be combined.
 *
 * @example
 * ```ts
 * const input: SearchProjectInput = {
 *   contentPattern: 'function.*search',
 *   caseSensitive: true,
 *   filePattern: '**\/*.ts',
 *   dateAfter: '2024-01-01',
 *   sizeMax: 1048576
 * };
 * ```
 */
export interface SearchProjectInput {
  contentPattern?: string;
  caseSensitive?: boolean;
  filePattern?: string;
  dateAfter?: string;
  dateBefore?: string;
  sizeMin?: number;
  sizeMax?: number;
}

/**
 * Tool for searching project files using various criteria.
 * Supports content search, file patterns, date ranges, and size filters.
 *
 * Key Features:
 * - Regex-based content search
 * - Glob pattern file matching
 * - Date range filtering
 * - File size filtering
 * - Case sensitivity control
 * - Error handling and reporting
 *
 * @example
 * ```ts
 * const search = new SearchProjectTool(
 *   'search_project',
 *   'Search project files',
 *   {},
 *   { resourceIntensive: true }
 * );
 *
 * // Search for TypeScript files containing 'export'
 * await search.runTool(interaction, {
 *   id: 'tool-1',
 *   name: 'search_project',
 *   toolInput: {
 *     contentPattern: 'export',
 *     filePattern: '**\/*.ts'
 *   }
 * }, projectEditor);
 * ```
 */
export default class SearchProjectTool extends LLMTool {
  get inputSchema(): LLMToolInputSchema {
    return {
      type: 'object',
      properties: {
        contentPattern: {
          type: 'string',
          description: String
            .raw`A grep-compatible regular expression to search file contents. Examples:
* "function.*search" matches lines containing "function" followed by "search"
* "\bclass\b" matches the word "class" with word boundaries
* "import.*from" matches import statements
Special characters must be escaped with backslash:
* "\." for literal dot
* "\*" for literal asterisk
* "\?" for literal question mark
* "\(" and "\)" for parentheses
Leave empty to search only by file name, date, or size.`,
        },
        caseSensitive: {
          type: 'boolean',
          description:
            'Controls case sensitivity of the contentPattern regex. Default is false (case-insensitive). Examples:\n* true: "Class" matches "Class" but not "class"\n* false: "Class" matches both "Class" and "class"',
          default: false,
        },
        filePattern: {
          type: 'string',
          description:
            'Glob pattern(s) to filter files by name. IMPORTANT PATTERN RULES:\n\n1. Directory Traversal (`**`):\n   * ONLY use between directory separators\n   * Matches one or more directory levels\n   * Example: `src/**/*.ts` matches TypeScript files in src subdirectories\n   * CANNOT use within filenames\n\n2. Character Matching (`*`):\n   * Use within directory or file names\n   * Matches any characters except directory separator\n   * Example: `src/*.ts` matches TypeScript files in src directory only\n\n3. Common Patterns:\n   * `dir/*` - files IN directory only\n   * `dir/**/*` - files in subdirectories only\n   * `dir/*|dir/**/*` - files in directory AND subdirectories\n   * `**/*.test.ts` - test files at any depth\n   * `**/util/*.ts` - TypeScript files in any util directory\n\n4. Multiple Patterns:\n   * Use pipe | to separate\n   * Example: `*.ts|*.js` matches both TypeScript and JavaScript files\n   * Example: `src/*|test/*` matches files in both directories',
        },
        dateAfter: {
          type: 'string',
          description:
            'Include only files modified after this date. Must be in YYYY-MM-DD format. Example: "2024-01-01" for files modified after January 1st, 2024.',
        },
        dateBefore: {
          type: 'string',
          description:
            'Include only files modified before this date. Must be in YYYY-MM-DD format. Example: "2024-12-31" for files modified before December 31st, 2024.',
        },
        sizeMin: {
          type: 'number',
          description:
            'Include only files larger than this size in bytes. Examples:\n* 1024 for files larger than 1KB\n* 1048576 for files larger than 1MB',
        },
        sizeMax: {
          type: 'number',
          description:
            'Include only files smaller than this size in bytes. Examples:\n* 1024 for files smaller than 1KB\n* 1048576 for files smaller than 1MB',
        },
      },
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

  async runTool(
    _interaction: IConversationInteraction,
    toolUse: LLMAnswerToolUse,
    projectEditor: IProjectEditor,
  ): Promise<LLMToolRunResult> {
    const input = toolUse.toolInput as SearchProjectInput;
    const {
      contentPattern,
      caseSensitive = false,
      filePattern,
      dateAfter,
      dateBefore,
      sizeMin,
      sizeMax,
    } = input;

    try {
      let result;
      if (contentPattern) {
        // Search file contents
        result = await this.searchFilesContent(
          projectEditor.projectRoot,
          contentPattern,
          caseSensitive,
          {
            filePattern,
            dateAfter,
            dateBefore,
            sizeMin,
            sizeMax,
          },
        );
      } else {
        // Search metadata only
        result = await this.searchFilesMetadata(
          projectEditor.projectRoot,
          {
            filePattern,
            dateAfter,
            dateBefore,
            sizeMin,
            sizeMax,
          },
        );
      }

      const { files, errorMessage } = result;
      const searchCriteria = [
        contentPattern && `content pattern "${contentPattern}"`,
        contentPattern && `${caseSensitive ? 'case-sensitive' : 'case-insensitive'}`,
        filePattern && `file pattern "${filePattern}"`,
        dateAfter && `modified after ${dateAfter}`,
        dateBefore && `modified before ${dateBefore}`,
        sizeMin !== undefined && `minimum size ${sizeMin} bytes`,
        sizeMax !== undefined && `maximum size ${sizeMax} bytes`,
      ].filter(Boolean).join(', ');

      const toolResults = `${errorMessage ? `Error: ${errorMessage}\n\n` : ''}
${files.length} files match the search criteria: ${searchCriteria}
${files.length > 0 ? `\n<files>\n${files.join('\n')}\n</files>` : ''}`;

      const toolResponse =
        `Found ${files.length} files matching the search criteria: ${searchCriteria}`;
      const bbResponse =
        `BB found ${files.length} files matching the search criteria: ${searchCriteria}`;

      return { toolResults, toolResponse, bbResponse };
    } catch (error) {
      const errorMessage = `Error searching project: ${(error as Error).message}`;
      throw new Error(errorMessage);
    }
  }

  // Helper methods would be implemented here or imported from a utility module
  /**
   * Searches file contents using a regex pattern.
   * Applies additional filters based on file metadata.
   *
   * @param projectRoot - Root directory to search in
   * @param pattern - Regex pattern to search for
   * @param caseSensitive - Whether to match case
   * @param options - Additional search filters
   * @returns Promise resolving to matched files and any errors
   * @private
   */
  private async searchFilesContent(
    projectRoot: string,
    pattern: string,
    caseSensitive: boolean,
    options: {
      filePattern?: string;
      dateAfter?: string;
      dateBefore?: string;
      sizeMin?: number;
      sizeMax?: number;
    },
  ): Promise<{ files: string[]; errorMessage?: string }> {
    // Implementation would go here
    // This is just a placeholder
    return { files: [] };
  }

  /**
   * Searches files based on metadata criteria only.
   * Used when no content pattern is provided.
   *
   * @param projectRoot - Root directory to search in
   * @param options - Search filters (pattern, dates, size)
   * @returns Promise resolving to matched files and any errors
   * @private
   */
  private async searchFilesMetadata(
    projectRoot: string,
    options: {
      filePattern?: string;
      dateAfter?: string;
      dateBefore?: string;
      sizeMin?: number;
      sizeMax?: number;
    },
  ): Promise<{ files: string[]; errorMessage?: string }> {
    // Implementation would go here
    // This is just a placeholder
    return { files: [] };
  }
}
