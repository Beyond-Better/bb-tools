/**
 * Example plugins demonstrating BB Plugin framework usage.
 * Provides reference implementations of plugin structure and common tool patterns.
 *
 * Available Plugins:
 * - search-plugin: Contains SearchProjectTool for searching project files
 * - browser-plugin: Contains LLMToolOpenInBrowser for opening URLs in browsers
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
 *   toolInput: { filePattern: '**\/*.ts' }
 * }, projectEditor);
 * ```
 *
 * Note: Example plugins use the new .bbplugin structure with manifest.json.
 * Legacy standalone .tool directories are deprecated.
 *
 * @module
 */

export { default as SearchProjectTool } from './search-plugin.bbplugin/search-project.tool/tool.ts';
export type { SearchProjectInput } from './search-plugin.bbplugin/search-project.tool/tool.ts';

export { default as LLMToolOpenInBrowser } from './browser-plugin.bbplugin/open-in-browser.tool/tool.ts';
export type { LLMToolOpenInBrowserInput } from './browser-plugin.bbplugin/open-in-browser.tool/types.ts';
