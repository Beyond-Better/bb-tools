import type { FileMetadata, TokenUsage, ToolUsageStats } from './types.ts';
import type { LLMMessageContentParts } from './message.ts';
import type { IProjectEditor } from './project_editor.ts';

/**
 * Interaction management module for the BB Tools Framework.
 * Provides interfaces and types for managing interaction state, resource handling,
 * and tool usage tracking within an interaction context.
 *
 * Note: This interface represents capabilities available to tools during execution.
 * It is extracted from BB's LLMConversationInteraction implementation.
 *
 * @module
 */

/**
 * Core interface representing the interaction capabilities needed by tools.
 * Provides methods for managing resources, tracking tool usage, and handling interaction state.
 *
 * This interface is what tools receive when they execute - it provides access to:
 * - Resource management (reading/writing files and other resources)
 * - Conversation/interaction context
 * - Project editing capabilities
 * - Tool usage statistics
 *
 * @example
 * ```ts
 * class MyTool extends LLMTool {
 *   async runTool(
 *     interaction: IConversationInteraction,
 *     toolUse: LLMAnswerToolUse,
 *     projectEditor: IProjectEditor
 *   ) {
 *     // Access interaction capabilities
 *     const stats = interaction.getToolUsageStats();
 *
 *     // Read resource content
 *     const content = await interaction.readResourceContent(
 *       'bb+filesystem+project+file:./src/config.ts',
 *       'rev-123',
 *       metadata
 *     );
 *
 *     return { toolResults, toolResponse, bbResponse };
 *   }
 * }
 * ```
 */
export interface IConversationInteraction {
  /**
   * Reference to the project editor.
   * Provides access to project-level operations and configuration.
   *
   * @example
   * ```ts
   * const projectRoot = interaction.projectEditor.projectRoot;
   * const dsConnections = interaction.projectEditor.dsConnections;
   * ```
   */
  projectEditor: IProjectEditor;

  /**
   * Retrieves metadata for a specific resource revision.
   * Used to get information about a resource without reading its contents.
   *
   * @param resourceUri - URI of the resource (e.g., 'bb+filesystem+project+file:./src/config.ts')
   * @param revisionId - Unique identifier for the resource revision
   * @returns Resource metadata if found, undefined otherwise
   *
   * @example
   * ```ts
   * const metadata = interaction.getFileMetadata(
   *   'bb+filesystem+project+file:./src/config.ts',
   *   'rev-123'
   * );
   * if (metadata) {
   *   console.log(`Resource size: ${metadata.size} bytes`);
   * }
   * ```
   */
  getFileMetadata(
    resourceUri: string,
    revisionId: string,
  ): FileMetadata | undefined;

  /**
   * Reads the content of a resource for a specific revision.
   * Supports both text and binary resources.
   *
   * @param resourceUri - URI of the resource
   * @param revisionId - Unique identifier for the resource revision
   * @param resourceMetadata - Optional metadata for the resource
   * @returns Promise resolving to resource content as string or Uint8Array
   *
   * @example
   * ```ts
   * const content = await interaction.readResourceContent(
   *   'bb+filesystem+project+file:./src/config.ts',
   *   'rev-123',
   *   metadata
   * );
   * if (typeof content === 'string') {
   *   console.log('Resource content:', content);
   * }
   * ```
   */
  readResourceContent(
    resourceUri: string,
    revisionId: string,
    resourceMetadata: FileMetadata | undefined,
  ): Promise<string | Uint8Array>;

  /**
   * Stores a new revision of a resource.
   * Creates or updates resource content while maintaining revision history.
   *
   * @param resourceUri - URI of the resource
   * @param revisionId - Unique identifier for the new revision
   * @param content - New resource content as string or Uint8Array
   * @param resourceMetadata - Metadata for the resource
   *
   * @example
   * ```ts
   * await interaction.storeResourceRevision(
   *   'bb+filesystem+project+file:./src/config.ts',
   *   'rev-124',
   *   'export const config = { debug: true };',
   *   metadata
   * );
   * ```
   */
  storeResourceRevision(
    resourceUri: string,
    revisionId: string,
    content: string | Uint8Array,
    resourceMetadata: FileMetadata | undefined,
  ): Promise<void>;

  /**
   * Retrieves a specific revision of a resource.
   * Used to access historical versions of resources.
   *
   * @param resourceUri - URI of the resource
   * @param revisionId - Unique identifier for the resource revision
   * @param resourceMetadata - Optional metadata for the resource
   * @returns Promise resolving to resource content or null if not found
   *
   * @example
   * ```ts
   * const oldContent = await interaction.getResourceRevision(
   *   'bb+filesystem+project+file:./src/config.ts',
   *   'rev-100',
   *   metadata
   * );
   * if (oldContent) {
   *   console.log('Previous version:', oldContent);
   * }
   * ```
   */
  getResourceRevision(
    resourceUri: string,
    revisionId: string,
    resourceMetadata: FileMetadata | undefined,
  ): Promise<string | Uint8Array | null>;

  /**
   * Retrieves current tool usage statistics.
   * Used to track and analyze tool usage patterns.
   *
   * @returns Current tool usage statistics
   *
   * @example
   * ```ts
   * const stats = interaction.getToolUsageStats();
   * console.log(`Most used tool: ${[...stats.toolCounts.entries()]
   *   .sort((a, b) => b[1] - a[1])[0][0]}`);
   * ```
   */
  getToolUsageStats(): ToolUsageStats;

  /**
   * Updates statistics for a specific tool.
   * Records tool usage and success/failure status.
   *
   * @param toolName - Name of the tool being tracked
   * @param success - Whether the tool operation succeeded
   *
   * @example
   * ```ts
   * interaction.updateToolStats('search_files', true);
   * ```
   */
  updateToolStats(toolName: string, success: boolean): void;

  /**
   * Current token usage statistics for the interaction.
   * Tracks input, output, and cache-related token usage.
   *
   * @example
   * ```ts
   * const usage = interaction.tokenUsageConversation;
   * console.log(`Total tokens used: ${usage.totalTokens}`);
   * ```
   */
  tokenUsageConversation: TokenUsage;

  /**
   * Adds a single resource to the interaction context.
   * Associates resource with a specific message and optional tool use.
   *
   * @param resourceUri - URI of the resource
   * @param metadata - Resource metadata excluding URI
   * @param messageId - ID of the message this resource is associated with
   * @param toolUseId - Optional ID of the tool use that added this resource
   * @returns Object containing resource URI and complete metadata
   *
   * @example
   * ```ts
   * const { resourceMetadata } = interaction.addResourceForMessage(
   *   'bb+filesystem+project+file:./src/config.ts',
   *   { type: 'text', size: 1024, lastModified: new Date() },
   *   'msg-123'
   * );
   * ```
   */
  addResourceForMessage(
    resourceUri: string,
    metadata: Omit<FileMetadata, 'path'>,
    messageId: string,
    toolUseId?: string,
  ): { resourceUri: string; resourceMetadata: FileMetadata };

  /**
   * Adds multiple resources to the interaction context.
   * Efficiently handles batch resource additions.
   *
   * @param resourcesToAdd - Array of resources with their metadata
   * @param messageId - ID of the message these resources are associated with
   * @param toolUseId - Optional ID of the tool use that added these resources
   * @returns Array of objects containing resource URIs and complete metadata
   *
   * @example
   * ```ts
   * const resources = await interaction.addResourcesForMessage([
   *   {
   *     resourceUri: 'bb+filesystem+project+file:./src/config.ts',
   *     metadata: { type: 'text', size: 1024, lastModified: new Date() }
   *   },
   *   {
   *     resourceUri: 'bb+filesystem+project+file:./src/types.ts',
   *     metadata: { type: 'text', size: 2048, lastModified: new Date() }
   *   }
   * ], 'msg-123');
   * ```
   */
  addResourcesForMessage(
    resourcesToAdd: Array<{
      resourceName?: string;
      resourceUri: string;
      metadata: Omit<FileMetadata, 'path'>;
    }>,
    messageId: string,
    toolUseId?: string,
  ): Array<{ resourceUri: string; resourceMetadata: FileMetadata }>;

  /**
   * Creates message content blocks for a specific resource revision.
   * Used to include resource content in conversation messages.
   *
   * @param resourceUri - URI of the resource
   * @param revisionId - Unique identifier for the resource revision
   * @param turnIndex - Index of the conversation turn
   * @returns Promise resolving to content blocks or null if resource cannot be processed
   *
   * @example
   * ```ts
   * const blocks = await interaction.createResourceContentBlocks(
   *   'bb+filesystem+project+file:./src/config.ts',
   *   'rev-123',
   *   5
   * );
   * if (blocks) {
   *   console.log(`Created ${blocks.length} content blocks`);
   * }
   * ```
   */
  createResourceContentBlocks(
    resourceUri: string,
    revisionId: string,
    turnIndex: number,
  ): Promise<LLMMessageContentParts | null>;
}
