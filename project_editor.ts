import type { IConversationInteraction } from "./conversation.ts";
import type { FileMetadata } from "./types.ts";

/**
 * Core interface representing the project editing capabilities needed by tools
 */
export interface IProjectEditor {
  /** Unique identifier for the project */
  projectId: string;

  /** Root directory path of the project */
  projectRoot: string;

  /** Set of files that have been modified */
  changedFiles: Set<string>;

  /** Map of file paths to their modified contents */
  changeContents: Map<string, string>;

  /**
   * Log changes to files and commit them to the project history
   * @param interaction The conversation interaction context
   * @param files Array of file paths that were modified
   * @param contents Array of file contents or change descriptions
   */
  logAndCommitChanges(
    interaction: IConversationInteraction,
    files: string[],
    contents: string[],
  ): Promise<void>;

  /**
   * Prepare files to be added to the conversation
   * @param fileNames Array of file paths to prepare
   * @returns Array of prepared files with metadata
   */
  prepareFilesForConversation(
    fileNames: string[],
  ): Promise<
    Array<{
      fileName: string;
      metadata: Omit<FileMetadata, "path">;
    }>
  >;
}
