import type { IConversationInteraction } from './conversation.ts';
import type { FileMetadata } from './types.ts';

/**
 * Project management module for the BB Tools Framework.
 * Provides interfaces and types for managing project files, tracking changes,
 * and maintaining project state.
 *
 * @module
 */

/**
 * Core interface representing the project editing capabilities needed by tools.
 * Provides methods for managing project files, tracking changes, and maintaining
 * project state. Implementations handle the actual file system operations.
 *
 * @example
 * ```ts
 * class FileSystemProjectEditor implements IProjectEditor {
 *   constructor(public projectId: string, public projectRoot: string) {
 *     this.changedFiles = new Set();
 *     this.changeContents = new Map();
 *   }
 *
 *   async logAndCommitChanges(interaction, files, contents) {
 *     // Implementation
 *   }
 *
 *   // ... other method implementations
 * }
 * ```
 */
export interface IProjectEditor {
  /**
   * Unique identifier for the project.
   * Used to distinguish between different projects in multi-project environments.
   *
   * @example
   * ```ts
   * const editor = new ProjectEditor('proj-123', '/path/to/project');
   * console.log(`Working on project: ${editor.projectId}`);
   * ```
   */
  projectId: string;

  /**
   * Root directory path of the project.
   * All project file paths are relative to this directory.
   *
   * @example
   * ```ts
   * const editor = new ProjectEditor('proj-123', '/path/to/project');
   * const configPath = path.join(editor.projectRoot, 'src/config.ts');
   * ```
   */
  projectRoot: string;

  /**
   * Set of files that have been modified during the current session.
   * Tracks which files need to be committed or processed.
   *
   * @example
   * ```ts
   * if (editor.changedFiles.has('src/config.ts')) {
   *   console.log('Config file has been modified');
   * }
   * ```
   */
  changedFiles: Set<string>;

  /**
   * Map of file paths to their modified contents.
   * Stores pending changes before they are committed.
   *
   * @example
   * ```ts
   * const newContent = editor.changeContents.get('src/config.ts');
   * if (newContent) {
   *   console.log('Pending changes:', newContent);
   * }
   * ```
   */
  changeContents: Map<string, string>;

  /**
   * Log changes to files and commit them to the project history.
   * Records file modifications and updates the project state.
   *
   * @param interaction - The conversation interaction context
   * @param files - Array of file paths that were modified
   * @param contents - Array of file contents or change descriptions
   *
   * @example
   * ```ts
   * await editor.logAndCommitChanges(
   *   interaction,
   *   ['src/config.ts'],
   *   ['Updated debug settings']
   * );
   * ```
   */
  /**
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
   * Prepare files to be added to the conversation.
   * Gathers metadata and validates files before addition.
   *
   * @param fileNames - Array of file paths to prepare
   * @returns Promise resolving to array of prepared files with metadata
   *
   * @example
   * ```ts
   * const files = await editor.prepareFilesForConversation([
   *   'src/config.ts',
   *   'src/types.ts'
   * ]);
   * console.log(`Prepared ${files.length} files`);
   * ```
   */
  /**
   * @param fileNames Array of file paths to prepare
   * @returns Array of prepared files with metadata
   */
  prepareFilesForConversation(
    fileNames: string[],
  ): Promise<
    Array<{
      fileName: string;
      metadata: Omit<FileMetadata, 'path'>;
    }>
  >;

  /**
   * Resolves a file path relative to the project root.
   * Ensures paths are properly formatted and within project bounds.
   *
   * @param filePath - Path to resolve (relative or absolute)
   * @returns Promise resolving to normalized project-relative path
   *
   * @example
   * ```ts
   * const resolved = await editor.resolveProjectFilePath('../config.ts');
   * console.log('Resolved path:', resolved);
   * ```
   */
  resolveProjectFilePath(
    filePath: string,
  ): Promise<string>;

  /**
   * Checks if a path is within the project directory.
   * Security measure to prevent access to files outside project.
   *
   * @param filePath - Path to check (relative or absolute)
   * @returns Promise resolving to true if path is within project
   *
   * @example
   * ```ts
   * if (await editor.isPathWithinProject('src/config.ts')) {
   *   console.log('Path is safe to use');
   * }
   * ```
   */
  isPathWithinProject(
    filePath: string,
  ): Promise<boolean>;
}
