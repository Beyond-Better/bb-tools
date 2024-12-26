/**
 * Types for the Open in Browser tool.
 * Defines input and response structures for browser operations.
 *
 * @module
 */

/**
 * Input parameters for opening URLs in a browser.
 *
 * @example
 * ```ts
 * const input: LLMToolOpenInBrowserInput = {
 *   urls: ['https://example.com', 'docs/index.html'],
 *   browser: 'firefox'
 * };
 * ```
 */
export interface LLMToolOpenInBrowserInput {
  urls: string[];
  browser?: string;
}

/**
 * Response data structure for browser operations.
 * Tracks successful and failed URL opens.
 *
 * @example
 * ```ts
 * const response: LLMToolOpenInBrowserResponseData = {
 *   data: {
 *     opensSuccess: ['Opened https://example.com in chrome'],
 *     opensError: ['docs/index.html could not be opened - file not found']
 *   }
 * };
 * ```
 */
export interface LLMToolOpenInBrowserResponseData {
  data: {
    opensSuccess: string[];
    opensError: string[];
  };
}

/**
 * Complete result of a browser tool operation.
 * Combines tool result and response data.
 *
 * @example
 * ```ts
 * const result: LLMToolOpenInBrowserResult = {
 *   toolResult: { /* raw tool output */ },
 *   bbResponse: {
 *     data: {
 *       opensSuccess: ['URL opened successfully'],
 *       opensError: []
 *     }
 *   }
 * };
 * ```
 */
export interface LLMToolOpenInBrowserResult {
  toolResult: unknown;
  bbResponse: LLMToolOpenInBrowserResponseData;
}
