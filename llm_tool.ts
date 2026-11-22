/**
 * Core LLM Tool implementation module for the BB Tools Framework.
 * Provides the base class and types for creating tools that can be used
 * by Language Learning Models (LLMs) to interact with projects and conversations.
 *
 * @module
 *
 * KEEP IN SYNC with bb-saas: this class mirrors `api/src/llms/llmTool.ts` (and `LLMToolMetadata`
 * in `api/src/llms/llmToolManager.ts`). BB loads plugin tools by duck typing (`new
 * module.default(...)`), so a member the API calls that is missing here makes plugin tools built
 * on this package fail at runtime. When the API's LLMTool changes, update this file and publish a
 * new version; see docs/keeping-in-sync.md.
 */

import type { JSX } from 'preact';
import type { JSONSchema4 } from 'json-schema';
import { Ajv } from 'ajv';

import { TOOL_STYLES_BROWSER, TOOL_STYLES_CONSOLE, TOOL_TAGS_BROWSER } from './llm_tool_tags.tsx';
import type { IConversationInteraction } from './interaction.ts';
import type { IProjectEditor } from './project_editor.ts';
import type { LLMAnswerToolUse, LLMMessageContentPart, LLMMessageContentParts } from './message.ts';
import type { DataSourceConnection } from './data_source.ts';

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
  finalizeCallback?: (messageId: string) => Promise<void>;
  /**
   * Estimated tokens of extra content this run adds to the conversation outside `toolResults`
   * (e.g. resource content attached later). BB counts it against the tool result size limit.
   */
  additionalContentTokens?: number;
}

/**
 * Data-residency policy of a tool when the API runs with `dataResidency: 'contained'`.
 * 'allowed' (the default) suits tools with no external egress; tools that send project data
 * to third-party services should declare something stricter.
 */
export type ResidencyPolicy = 'blocked' | 'soft-warn' | 'soft-admin-only' | 'allowed';

/** Where an API instance runs; a tool's `runsIn` limits it to some of them. */
export type ApiRunsIn = 'local' | 'remote';

/** Token budget passed to `handleOversizedResult` when a result exceeds the hard size limit. */
export interface ToolResultBudget {
  /** Model context window (tokens) */
  contextWindow: number;
  /** Results larger than this get an advisory appended */
  softTokens: number;
  /** Results larger than this are rejected */
  hardTokens: number;
  /** Remaining context budget (window - current - outputReserve - pending), floored at 0 */
  remainingTokens: number;
  /** Last known context size (from last assistant usage) */
  currentContextTokens: number;
  /** Tokens reserved for the next model response */
  outputReserveTokens: number;
}

/**
 * What `formatStatusSummary` may use besides the call's input: the project's data source
 * connections, so a call naming one by id can show its name instead.
 */
export interface LLMToolStatusContext {
  dsConnections?: ReadonlyArray<Pick<DataSourceConnection, 'id' | 'name'>>;
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

/** Schema of a tool's config, marking secret fields (stored behind a reference, shown masked). */
export interface ToolConfigSchema {
  type?: string | string[];
  description?: string;
  secret?: boolean;
  properties?: Record<string, ToolConfigSchema>;
  additionalProperties?: boolean | ToolConfigSchema;
  items?: ToolConfigSchema;
}

/** Text a tool adds to the system prompt (info.json `systemPromptAdditions`). */
export interface SystemPromptAdditionConfig {
  content: string;
  template?: boolean;
  placement?: 'start' | 'end';
  priority?: number;
  variables?: Record<string, string | string[]>;
  conditions?: {
    roles?: string[];
    providers?: string[];
    requireTools?: string[];
    excludeTools?: string[];
  };
}

export interface LLMToolMetadata {
  toolId: string;
  name: string;
  aliasNames?: string[]; // alternative names for backward compatibility
  version: string;
  protocolType: 'bb' | 'mcp';
  loadedFrom: 'builtin' | 'plugin' | 'mcp';
  author: string;
  license: string;
  description: string;
  purpose: string;
  /** Short friendly name for people (e.g. 'Find resources'), shown in status and approval cards */
  title?: string;
  path?: string; // is set by code, not part of manifest
  toolSets?: string | string[]; //defaults to 'core'
  category?: string | string[];
  capabilities?: string | string[];
  enabled?: boolean; //defaults to true
  mutates?: boolean; //defaults to true
  runsIn?: ApiRunsIn[]; // where the tool can run; empty/undefined = everywhere
  residencyPolicy?: ResidencyPolicy; // under dataResidency:'contained'; defaults to 'allowed'
  deprecated?: boolean | { since?: string; removeIn?: string; reason?: string }; //defaults to false
  replacedBy?: string; //when deprecated or retired is true
  retired?: boolean; // formatter-only: never offered to a model
  error?: string;
  /** Default config values */
  config?: unknown;
  /** Which config properties are secret */
  configSchema?: ToolConfigSchema;
  /** Config properties (dot paths) the tool can't run without */
  requiredConfig?: string[];
  mcpData?: Record<string, unknown>; //LLMToolMCPConfig
  pluginData?: {
    pluginName: string;
    version: string;
    author: string;
    description: string;
    license: string;
    bbVersion: string;
  };
  examples?: Array<{ description: string; input: unknown }>;
  systemPromptAdditions?: SystemPromptAdditionConfig | SystemPromptAdditionConfig[];
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
  public toolId: string;
  public features: LLMToolFeatures = {};
  /**
   * Data-residency policy under the API's `dataResidency: 'contained'`. Defaults to 'allowed';
   * override for tools that send project data to external services.
   */
  public residencyPolicy: ResidencyPolicy = 'allowed';

  constructor(
    public name: string,
    public description: string,
    public toolConfig: LLMToolConfig,
    public metadata: LLMToolMetadata,
  ) {
    this.toolId = metadata.toolId || `${metadata.loadedFrom || 'builtin'}:${metadata.name}`;
    this.features = { mutates: metadata.mutates || false };
    //logger.info(`LLMTool: Constructing tool ${name}`);
  }

  // deno-lint-ignore require-await
  public async init(): Promise<LLMTool> {
    return this;
  }

  /**
   * Called before `description` and `inputSchema` are read for the model. Override to set
   * context-dependent state (e.g. data-source-specific options) those getters use. The base
   * implementation does nothing; overrides may be async.
   */
  public async prepareToolsWithContext(_projectEditor: IProjectEditor): Promise<void> {}

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
    // compile() can add bookkeeping properties to the schema it gets; pass a copy so the shared
    // inputSchema stays clean (some providers reject unknown schema keys)
    const validate = ajv.compile(structuredClone(this.inputSchema));
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
   * Called when a result exceeds the hard size limit. Override to shrink it (truncate, paginate,
   * summarise) and return the replacement, which is measured again, or return null to reject the
   * result. The base implementation returns null.
   */
  // deno-lint-ignore require-await
  public async handleOversizedResult(
    _result: LLMToolRunResult,
    _budget: ToolResultBudget,
    _estimatedTokens: number,
  ): Promise<LLMToolRunResult | null> {
    return null;
  }

  /**
   * What this call is doing, as one plain sentence for the status bar (e.g. 'Searching the
   * project for "queue"'). Shown to everyone in the collaboration before the tool runs: keep it
   * quick and deterministic, and never include file contents or anything that may be secret.
   * The input is the model's and not yet validated, so read it defensively. Return undefined (the
   * base implementation) to show the tool's info.json `title`.
   */
  public formatStatusSummary(
    _toolInput: LLMToolInputSchema,
    _context?: LLMToolStatusContext,
  ): string | undefined {
    return undefined;
  }

  /** The name people read for this tool on approval cards: its info.json `title`, if any. */
  public get approvalTitle(): string | undefined {
    return this.metadata.title?.trim() || undefined;
  }

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
