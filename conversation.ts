import type { FileMetadata, TokenUsage, ToolUsageStats } from './types.ts';
import type { LLMMessageContentPart, LLMMessageContentParts } from './message.ts';

/**
 * Core interface representing the conversation interaction capabilities needed by tools
 */
export interface IConversationInteraction {
  /** Get metadata for a specific file and revision */
  getFileMetadata(
    filePath: string,
    revisionId: string,
  ): FileMetadata | undefined;

  /** Read the content of a project file */
  readProjectFileContent(
    filePath: string,
    revisionId: string,
  ): Promise<string | Uint8Array>;

  /** Store a file revision */
  storeFileRevision(
    filePath: string,
    revisionId: string,
    content: string | Uint8Array,
  ): Promise<void>;

  /** Get a specific file revision */
  getFileRevision(
    filePath: string,
    revisionId: string,
  ): Promise<string | Uint8Array | null>;

  /** Get tool usage statistics */
  getToolUsageStats(): ToolUsageStats;

  /** Update tool statistics */
  updateToolStats(toolName: string, success: boolean): void;

  /** Get token usage for the conversation */
  tokenUsageConversation: TokenUsage;

  /** Add a file to the conversation with metadata */
  addFileForMessage(
    filePath: string,
    metadata: Omit<FileMetadata, 'path'>,
    messageId: string,
    toolUseId?: string,
  ): { filePath: string; fileMetadata: FileMetadata };

  /** Add multiple files to the conversation */
  addFilesForMessage(
    filesToAdd: Array<{
      fileName: string;
      metadata: Omit<FileMetadata, 'path'>;
    }>,
    messageId: string,
    toolUseId?: string,
  ): Array<{ filePath: string; fileMetadata: FileMetadata }>;

  /** Create content blocks for a file */
  createFileContentBlocks(
    filePath: string,
    revisionId: string,
    turnIndex: number,
  ): Promise<LLMMessageContentParts | null>;
}
