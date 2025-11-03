/**
 * Core LLM Tool implementation module for the BB Tools Framework.
 * Provides the base class and types for creating tools that can be used
 * by Language Learning Models (LLMs) to interact with projects and conversations.
 *
 * @module
 */

import type { JSX } from 'preact';
import type { JSONSchema4 } from 'json-schema';
import { Ajv } from 'ajv';

import { TOOL_STYLES_BROWSER, TOOL_STYLES_CONSOLE, TOOL_TAGS_BROWSER } from './llm_tool_tags.tsx';
import type { IConversationInteraction } from './interaction.ts';
import type { IProjectEditor } from './project_editor.ts';
import type { LLMAnswerToolUse, LLMMessageContentPart, LLMMessageContentParts } from './message.ts';

/**
 * JSON Schema definition for tool input validation.
 * Used to ensure tool inputs match expected format.
 *
 * @example
 * ```ts
 * const schema: LLMToolInputSchema = {
 *   type: 'object',
 *   properties: {
 *     query: { type: 'string' },
 *     limit: { type: 'number' }
 *   },
 *   required: ['query']
 * };
 * ```
 */
export type LLMToolInputSchema = JSONSchema4;
/**
 * Valid content types that can be returned as tool results.
 * Can be plain text, a single content part, or multiple content parts.
 *
 * @example
 * ```ts
 * const result: LLMToolRunResultContent = [
 *   { type: 'text', text: 'Operation completed' },
 *   { type: 'image', source: { type: 'base64', media_type: 'image/png', data: '...' } }
 * ];
 * ```
 */
export type LLMToolRunResultContent =
  | string
  | LLMMessageContentPart
  | LLMMessageContentParts;
export type LLMToolRunToolResponse = string;

export interface LLMToolRunBbResponseData {
  data: unknown;
}
export type LLMToolRunBbResponse = LLMToolRunBbResponseData | string;

/**
 * Complete result of a tool execution.
 * Includes tool-specific results, response text, and optional callback.
 *
 * @example
 * ```ts
 * const result: LLMToolRunResult = {
 *   toolResults: { type: 'text', text: 'Found 3 files' },
 *   toolResponse: 'Successfully searched files',
 *   bbResponse: { data: { fileCount: 3 } }
 * };
 * ```
 */
export interface LLMToolRunResult {
  toolResults: LLMToolRunResultContent;
  toolResponse: LLMToolRunToolResponse;
  bbResponse: LLMToolRunBbResponse;
  finalizeCallback?: (messageId: string) => void;
}

/**
 * Feature flags describing a tool's capabilities and requirements.
 * Used to inform the LLM about how the tool operates.
 *
 * @example
 * ```ts
 * const features: LLMToolFeatures = {
 *   mutates: true,        // Tool modifies resources
 *   stateful: false,      // Tool doesn't maintain state
 *   async: true,         // Tool runs asynchronously
 *   idempotent: true,    // Multiple runs produce same result
 *   resourceIntensive: false,  // Tool is lightweight
 *   requiresNetwork: false    // Tool works offline
 * };
 * ```
 */
export interface LLMToolFeatures {
  mutates?: boolean; // Whether tool modifies resources
  stateful?: boolean; // Whether tool maintains state
  async?: boolean; // Whether tool runs asynchronously
  idempotent?: boolean; // Whether multiple runs produce same result
  resourceIntensive?: boolean; // Whether tool needs significant resources
  requiresNetwork?: boolean; // Whether tool needs internet access
}

export type LLMToolConfig = Record<string, unknown>;

export type LLMToolFormatterDestination = 'console' | 'browser';
export type LLMToolUseInputFormatter = (
  toolInput: LLMToolInputSchema,
  format: LLMToolFormatterDestination,
) => string;
export type LLMToolRunResultFormatter = (
  resultContent: unknown,
  format: LLMToolFormatterDestination,
) => string;

/**
 * Formatted result structure for destination-specific output.
 * Used by both browser and console formatters to provide consistent structure.
 *
 * @example
 * ```ts
 * // Browser destination result
 * const browserResult: LLMToolLogEntryFormattedResult = {
 *   title: <h2>Search Results</h2>,
 *   subtitle: <h3>Found 3 matches</h3>,
 *   content: <div>...</div>,
 *   preview: <span>3 matches found</span>
 * };
 *
 * // Console destination result
 * const consoleResult: LLMToolLogEntryFormattedResult = {
 *   title: 'Search Results',
 *   subtitle: 'Found 3 matches',
 *   content: '...',
 *   preview: '3 matches found'
 * };
 * ```
 */
export interface LLMToolLogEntryFormattedResult {
  title: string | JSX.Element;
  subtitle?: string | JSX.Element;
  content: string | JSX.Element;
  preview: string | JSX.Element;
}

/**
 * Base class for all LLM tools in the BB Tools Framework.
 * Provides core functionality for input validation, execution, and result formatting.
 *
 * @example
 * ```ts
 * class SearchTool extends LLMTool {
 *   get inputSchema() {
 *     return {
 *       type: 'object',
 *       properties: {
 *         query: { type: 'string' }
 *       },
 *       required: ['query']
 *     };
 *   }
 *
 *   async runTool(interaction, toolUse, projectEditor) {
 *     // Tool implementation
 *     return {
 *       toolResults: { type: 'text', text: 'Results...' },
 *       toolResponse: 'Search completed',
 *       bbResponse: { data: { matches: [] } }
 *     };
 *   }
 *
 *   formatLogEntryToolUse(toolInput, format) {
 *     return {
 *       title: 'Search',
 *       content: `Searching for: ${toolInput.query}`,
 *       preview: 'Search operation'
 *     };
 *   }
 *
 *   formatLogEntryToolResult(resultContent, format) {
 *     return {
 *       title: 'Search Results',
 *       content: resultContent,
 *       preview: 'Found matches'
 *     };
 *   }
 * }
 * ```
 */
abstract class LLMTool {
  constructor(
    public name: string,
    public description: string,
    public toolConfig: LLMToolConfig,
    public features: LLMToolFeatures = {},
  ) {}

  // deno-lint-ignore require-await
  public async init(): Promise<LLMTool> {
    return this;
  }

  /**
   * JSON Schema defining the expected input format for the tool.
   * Must be implemented by each tool to enable input validation.
   *
   * @example
   * ```ts
   * get inputSchema() {
   *   return {
   *     type: 'object',
   *     properties: {
   *       query: { type: 'string', description: 'Search query' }
   *     },
   *     required: ['query']
   *   };
   * }
   * ```
   */
  abstract get inputSchema(): LLMToolInputSchema;

  /**
   * Validates tool input against the defined schema.
   * Uses AJV for JSON Schema validation.
   *
   * @param input - The input to validate
   * @returns True if input matches schema, false otherwise
   *
   * @example
   * ```ts
   * const isValid = tool.validateInput({ query: 'search term' });
   * if (!isValid) {
   *   throw new Error('Invalid input');
   * }
   * ```
   */
  validateInput(input: unknown): boolean {
    const ajv = new Ajv({ code: { esm: true } });
    const validate = ajv.compile(this.inputSchema);
    return validate(input) as boolean;
  }

  /**
   * Executes the tool's main functionality.
   * Must be implemented by each tool to define its behavior.
   *
   * @param interaction - Conversation interaction context
   * @param toolUse - Information about the current tool use
   * @param projectEditor - Project editing capabilities
   * @returns Promise resolving to the tool's execution results
   *
   * @example
   * ```ts
   * async runTool(interaction, toolUse, projectEditor) {
   *   const results = await performOperation(toolUse.toolInput);
   *   return {
   *     toolResults: { type: 'text', text: results },
   *     toolResponse: 'Operation completed',
   *     bbResponse: { data: results }
   *   };
   * }
   * ```
   */
  abstract runTool(
    interaction: IConversationInteraction,
    toolUse: LLMAnswerToolUse,
    projectEditor: IProjectEditor,
  ): Promise<LLMToolRunResult>;

  /**
   * Formats tool input for a specific destination (browser/console).
   * Creates formatted representation of tool input parameters.
   *
   * @param toolInput - The validated input provided to the tool
   * @param format - Target destination (console or browser)
   * @returns Formatted structure for the destination
   *
   * @example Browser Destination
   * ```tsx
   * formatLogEntryToolUse(toolInput, 'browser') {
   *   return {
   *     title: <h2>Search Files</h2>,
   *     subtitle: <h3>Query: {toolInput.query}</h3>,
   *     content: <div>Searching project files...</div>,
   *     preview: <span>Search operation</span>
   *   };
   * }
   * ```
   *
   * @example Console Destination
   * ```ts
   * formatLogEntryToolUse(toolInput, 'console') {
   *   return {
   *     title: 'Search Files',
   *     subtitle: `Query: ${toolInput.query}`,
   *     content: 'Searching project files...',
   *     preview: 'Search operation'
   *   };
   * }
   * ```
   */
  abstract formatLogEntryToolUse(
    toolInput: LLMToolInputSchema,
    format: LLMToolFormatterDestination,
  ): LLMToolLogEntryFormattedResult;

  /**
   * Formats tool results for a specific destination (browser/console).
   * Creates formatted representation of operation outcomes.
   *
   * @param resultContent - The content returned by the tool
   * @param format - Target destination (console or browser)
   * @returns Formatted structure for the destination
   *
   * @example Browser Destination
   * ```tsx
   * formatLogEntryToolResult(resultContent, 'browser') {
   *   return {
   *     title: <h2>Search Results</h2>,
   *     subtitle: <h3>Found {resultContent.matches.length} matches</h3>,
   *     content: <div>{resultContent.matches.map(m => <div>{m}</div>)}</div>,
   *     preview: <span>Search completed</span>
   *   };
   * }
   * ```
   *
   * @example Console Destination
   * ```ts
   * formatLogEntryToolResult(resultContent, 'console') {
   *   return {
   *     title: 'Search Results',
   *     subtitle: `Found ${resultContent.matches.length} matches`,
   *     content: resultContent.matches.join('\n'),
   *     preview: 'Search completed'
   *   };
   * }
   * ```
   */
  abstract formatLogEntryToolResult(
    resultContent: unknown,
    format: LLMToolFormatterDestination,
  ): LLMToolLogEntryFormattedResult;

  // Style constants for tool output formatting
  static readonly TOOL_TAGS_BROWSER = TOOL_TAGS_BROWSER;
  static readonly TOOL_STYLES_BROWSER = TOOL_STYLES_BROWSER;
  static readonly TOOL_STYLES_CONSOLE = TOOL_STYLES_CONSOLE;
}

export default LLMTool;
