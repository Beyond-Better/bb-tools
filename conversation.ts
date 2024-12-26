import type { FileMetadata, TokenUsage, ToolUsageStats } from './types.ts';
import type { LLMMessageContentPart, LLMMessageContentParts } from './message.ts';

/**
 * Conversation management module for the BB Tools Framework.
 * Provides interfaces and types for managing conversation state, file interactions,
 * and tool usage tracking within a conversation context.
 *
 * @module
 */

/**
 * Core interface representing the conversation interaction capabilities needed by tools.
 * Provides methods for managing files, tracking tool usage, and handling conversation state.
 *
 * @example
 * ```ts
 * class ConversationManager implements IConversationInteraction {
 *   async readProjectFileContent(filePath: string, revisionId: string) {
 *     // Implementation
 *     return await fs.readFile(filePath, 'utf8');
 *   }
 *   // ... other method implementations
 * }
 * ```
 */
export interface IConversationInteraction {
  /**
   * Retrieves metadata for a specific file and revision.
   * Used to get information about a file without reading its contents.
   *
   * @param filePath - Path to the file relative to project root
   * @param revisionId - Unique identifier for the file revision
   * @returns File metadata if found, undefined otherwise
   *
   * @example
   * ```ts
   * const metadata = conversation.getFileMetadata('src/config.ts', 'rev-123');
   * if (metadata) {
   *   console.log(`File size: ${metadata.size} bytes`);
   * }
   * ```
   */
  getFileMetadata(
    filePath: string,
    revisionId: string,
  ): FileMetadata | undefined;

  /**
   * Reads the content of a project file for a specific revision.
   * Supports both text and binary files.
   *
   * @param filePath - Path to the file relative to project root
   * @param revisionId - Unique identifier for the file revision
   * @returns Promise resolving to file content as string or Uint8Array
   *
   * @example
   * ```ts
   * const content = await conversation.readProjectFileContent('src/config.ts', 'rev-123');
   * if (typeof content === 'string') {
   *   console.log('File content:', content);
   * }
   * ```
   */
  readProjectFileContent(
    filePath: string,
    revisionId: string,
  ): Promise<string | Uint8Array>;

  /**
   * Stores a new revision of a file.
   * Creates or updates file content while maintaining revision history.
   *
   * @param filePath - Path to the file relative to project root
   * @param revisionId - Unique identifier for the new revision
   * @param content - New file content as string or Uint8Array
   *
   * @example
   * ```ts
   * await conversation.storeFileRevision(
   *   'src/config.ts',
   *   'rev-124',
   *   'export const config = { debug: true };'
   * );
   * ```
   */
  storeFileRevision(
    filePath: string,
    revisionId: string,
    content: string | Uint8Array,
  ): Promise<void>;

  /**
   * Retrieves a specific revision of a file.
   * Used to access historical versions of files.
   *
   * @param filePath - Path to the file relative to project root
   * @param revisionId - Unique identifier for the file revision
   * @returns Promise resolving to file content or null if not found
   *
   * @example
   * ```ts
   * const oldContent = await conversation.getFileRevision('src/config.ts', 'rev-100');
   * if (oldContent) {
   *   console.log('Previous version:', oldContent);
   * }
   * ```
   */
  getFileRevision(
    filePath: string,
    revisionId: string,
  ): Promise<string | Uint8Array | null>;

  /**
   * Retrieves current tool usage statistics.
   * Used to track and analyze tool usage patterns.
   *
   * @returns Current tool usage statistics
   *
   * @example
   * ```ts
   * const stats = conversation.getToolUsageStats();
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
   * conversation.updateToolStats('search_files', true);
   * ```
   */
  updateToolStats(toolName: string, success: boolean): void;

  /**
   * Current token usage statistics for the conversation.
   * Tracks input, output, and cache-related token usage.
   *
   * @example
   * ```ts
   * const usage = conversation.tokenUsageConversation;
   * console.log(`Total tokens used: ${usage.totalTokens}`);
   * ```
   */
  tokenUsageConversation: TokenUsage;

  /**
   * Adds a single file to the conversation context.
   * Associates file with a specific message and optional tool use.
   *
   * @param filePath - Path to the file relative to project root
   * @param metadata - File metadata excluding path
   * @param messageId - ID of the message this file is associated with
   * @param toolUseId - Optional ID of the tool use that added this file
   * @returns Object containing file path and complete metadata
   *
   * @example
   * ```ts
   * const { fileMetadata } = conversation.addFileForMessage(
   *   'src/config.ts',
   *   { type: 'text', size: 1024, lastModified: new Date() },
   *   'msg-123'
   * );
   * ```
   */
  addFileForMessage(
    filePath: string,
    metadata: Omit<FileMetadata, 'path'>,
    messageId: string,
    toolUseId?: string,
  ): { filePath: string; fileMetadata: FileMetadata };

  /**
   * Adds multiple files to the conversation context.
   * Efficiently handles batch file additions.
   *
   * @param filesToAdd - Array of files with their metadata
   * @param messageId - ID of the message these files are associated with
   * @param toolUseId - Optional ID of the tool use that added these files
   * @returns Array of objects containing file paths and complete metadata
   *
   * @example
   * ```ts
   * const files = await conversation.addFilesForMessage([
   *   {
   *     fileName: 'src/config.ts',
   *     metadata: { type: 'text', size: 1024, lastModified: new Date() }
   *   },
   *   {
   *     fileName: 'src/types.ts',
   *     metadata: { type: 'text', size: 2048, lastModified: new Date() }
   *   }
   * ], 'msg-123');
   * ```
   */
  addFilesForMessage(
    filesToAdd: Array<{
      fileName: string;
      metadata: Omit<FileMetadata, 'path'>;
    }>,
    messageId: string,
    toolUseId?: string,
  ): Array<{ filePath: string; fileMetadata: FileMetadata }>;

  /**
   * Creates message content blocks for a specific file revision.
   * Used to include file content in conversation messages.
   *
   * @param filePath - Path to the file relative to project root
   * @param revisionId - Unique identifier for the file revision
   * @param turnIndex - Index of the conversation turn
   * @returns Promise resolving to content blocks or null if file cannot be processed
   *
   * @example
   * ```ts
   * const blocks = await conversation.createFileContentBlocks(
   *   'src/config.ts',
   *   'rev-123',
   *   5
   * );
   * if (blocks) {
   *   console.log(`Created ${blocks.length} content blocks`);
   * }
   * ```
   */
  createFileContentBlocks(
    filePath: string,
    revisionId: string,
    turnIndex: number,
  ): Promise<LLMMessageContentParts | null>;
}
