/**
 * Example tools demonstrating BB Tools framework usage.
 * Provides reference implementations of common tool patterns.
 *
 * Available Tools:
 * - SearchProjectTool: Search project files by content and metadata
 * - LLMToolOpenInBrowser: Open URLs and local files in web browsers
 *
 * @example
 * ```ts
 * import { SearchProjectTool, LLMToolOpenInBrowser } from '@beyondbetter/tools/examples';
 *
 * // Initialize tools
 * const search = new SearchProjectTool('search', 'Search files', {});
 * const browser = new LLMToolOpenInBrowser('browser', 'Open URLs', {});
 *
 * // Use tools
 * await search.runTool(interaction, {
 *   id: 'tool-1',
 *   name: 'search',
 *   toolInput: { filePattern: '**/*.ts' }
 * }, projectEditor);
 * ```
 *
 * @module
 */

export { default as SearchProjectTool } from './search_project.tool/tool.ts';
export type { SearchProjectInput } from './search_project.tool/tool.ts';

export { default as LLMToolOpenInBrowser } from './open_in_browser.tool/tool.ts';
export type { LLMToolOpenInBrowserInput } from './open_in_browser.tool/types.ts';
