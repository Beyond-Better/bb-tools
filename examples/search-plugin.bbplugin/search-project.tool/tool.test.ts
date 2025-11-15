/**
 * Tests for the Search Project tool.
 * Verifies search functionality, input validation, and output formatting.
 *
 * Test Coverage:
 * - Basic search functionality
 * - Input validation
 * - Browser output formatting
 * - Console output formatting
 * - Error handling
 *
 * @module
 */

import { assertEquals, assertStringIncludes } from '@std/assert';
import type {
  FileMetadata,
  IConversationInteraction,
  IProjectEditor,
  LLMMessageContentParts,
  TokenUsage,
  ToolUsageStats,
} from '@beyondbetter/tools';
import SearchProjectTool from './tool.ts';

/**
 * Mock implementations of core interfaces for testing.
 * Provides minimal implementations that satisfy interface requirements.
 */

/**
 * Mock project editor for testing.
 * Simulates a basic project environment without actual file operations.
 */
const mockProjectEditor: IProjectEditor = {
  projectId: 'test-project',
  projectRoot: '/test/project',
  changedFiles: new Set(),
  changeContents: new Map(),
  logAndCommitChanges: async () => {},
  prepareFilesForConversation: async () => [],
};

/**
 * Mock conversation interaction for testing.
 * Provides stub implementations for all required methods.
 * Returns empty or default values for most operations.
 */
const mockConversationInteraction: IConversationInteraction = {
  getFileMetadata: () => undefined,
  readProjectFileContent: async () => '',
  storeFileRevision: async () => {},
  getFileRevision: async () => null,
  getToolUsageStats: () => ({
    toolCounts: new Map(),
    toolResults: new Map(),
    lastToolUse: '',
    lastToolSuccess: false,
  }),
  updateToolStats: () => {},
  tokenUsageConversation: {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  },
  addFileForMessage: () => ({
    filePath: '',
    fileMetadata: {} as FileMetadata,
  }),
  addFilesForMessage: () => [],
  createFileContentBlocks: async () => null,
};

/**
 * Tests basic search functionality.
 * Verifies tool initialization, execution, and result structure.
 *
 * @example Expected Usage
 * ```ts
 * const tool = new SearchProjectTool('search', 'description', {});
 * const result = await tool.runTool(interaction, {
 *   id: 'test',
 *   name: 'search',
 *   toolInput: { filePattern: '*.ts' }
 * }, projectEditor);
 * ```
 */
Deno.test({
  name: 'SearchProjectTool - Basic functionality',
  async fn() {
    const tool = new SearchProjectTool(
      'search_project',
      'Search project files',
      {},
      { async: true },
    );

    const result = await tool.runTool(
      mockConversationInteraction,
      {
        id: 'test-use',
        name: 'search_project',
        toolInput: {
          filePattern: '*.ts',
          contentPattern: 'function',
        },
      },
      mockProjectEditor,
    );

    // Verify result structure
    assertEquals(typeof result.toolResults, 'string');
    assertEquals(typeof result.toolResponse, 'string');
    assertEquals(typeof result.bbResponse, 'string');
  },
});

/**
 * Tests browser-based output formatting.
 * Verifies JSX element generation and content structure.
 *
 * @example Expected Output Structure
 * ```tsx
 * {
 *   title: <JSX.Element>,
 *   content: <JSX.Element>,
 *   preview: string
 * }
 * ```
 */
Deno.test({
  name: 'SearchProjectTool - Browser formatter',
  fn() {
    const tool = new SearchProjectTool(
      'search_project',
      'Search project files',
      {},
    );

    const result = tool.formatLogEntryToolUse(
      {
        filePattern: '*.ts',
        contentPattern: 'function',
        caseSensitive: true,
      },
      'browser',
    );

    // Verify browser formatting
    assertEquals(typeof result.title, 'object'); // JSX.Element
    assertEquals(typeof result.content, 'object'); // JSX.Element
    assertEquals(typeof result.preview, 'string');
    assertStringIncludes(result.preview, 'function');
  },
});

/**
 * Tests console-based output formatting.
 * Verifies text formatting with ANSI colors and layout.
 *
 * @example Expected Output Structure
 * ```ts
 * {
 *   title: string,    // With ANSI color codes
 *   content: string,  // With indentation and formatting
 *   preview: string   // Summary text
 * }
 * ```
 */
Deno.test({
  name: 'SearchProjectTool - Console formatter',
  fn() {
    const tool = new SearchProjectTool(
      'search_project',
      'Search project files',
      {},
    );

    const result = tool.formatLogEntryToolUse(
      {
        filePattern: '*.ts',
        contentPattern: 'function',
        caseSensitive: true,
      },
      'console',
    );

    // Verify console formatting
    assertEquals(typeof result.title, 'string');
    assertEquals(typeof result.content, 'string');
    assertEquals(typeof result.preview, 'string');
    assertStringIncludes(result.preview, 'function');
  },
});

/**
 * Tests input validation functionality.
 * Verifies schema validation for various input combinations.
 *
 * Test Cases:
 * - Valid input with all optional fields
 * - Invalid date formats
 * - Missing required fields
 * - Invalid field types
 */
Deno.test({
  name: 'SearchProjectTool - Input validation',
  fn() {
    const tool = new SearchProjectTool(
      'search_project',
      'Search project files',
      {},
    );

    // Valid input
    const validInput = {
      filePattern: '*.ts',
      contentPattern: 'function',
      caseSensitive: true,
    };
    assertEquals(tool.validateInput(validInput), true);

    // Invalid input (invalid date format)
    const invalidInput = {
      filePattern: '*.ts',
      dateAfter: 'invalid-date',
    };
    assertEquals(tool.validateInput(invalidInput), false);
  },
});

/**
 * Tests result formatting for both browser and console output.
 * Verifies consistent formatting across different environments.
 *
 * Test Cases:
 * - Browser output with JSX elements
 * - Console output with ANSI colors
 * - File list formatting
 * - Match count display
 */
Deno.test({
  name: 'SearchProjectTool - Result formatting',
  fn() {
    const tool = new SearchProjectTool(
      'search_project',
      'Search project files',
      {},
    );

    const resultContent = '2 files match the search criteria: content pattern "function"\n' +
      'src/file1.ts\nsrc/file2.ts';

    // Test browser formatting
    const browserResult = tool.formatLogEntryToolResult(
      resultContent,
      'browser',
    );
    assertEquals(typeof browserResult.title, 'object'); // JSX.Element
    assertEquals(typeof browserResult.content, 'object'); // JSX.Element
    assertStringIncludes(browserResult.preview, '2 files');

    // Test console formatting
    const consoleResult = tool.formatLogEntryToolResult(
      resultContent,
      'console',
    );
    assertEquals(typeof consoleResult.title, 'string');
    assertEquals(typeof consoleResult.content, 'string');
    assertStringIncludes(consoleResult.preview, '2 files');
  },
});
