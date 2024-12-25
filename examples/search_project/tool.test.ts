import { assertEquals, assertStringIncludes } from "@std/assert";
import type { 
  IConversationInteraction, 
  IProjectEditor,
  FileMetadata,
  TokenUsage,
  ToolUsageStats,
  LLMMessageContentParts
} from '@beyondbetter/tools';
import SearchProjectTool from './tool.ts';

// Mock implementations
const mockProjectEditor: IProjectEditor = {
  projectId: 'test-project',
  projectRoot: '/test/project',
  changedFiles: new Set(),
  changeContents: new Map(),
  logAndCommitChanges: async () => {},
  prepareFilesForConversation: async () => []
};

const mockConversationInteraction: IConversationInteraction = {
  getFileMetadata: () => undefined,
  readProjectFileContent: async () => '',
  storeFileRevision: async () => {},
  getFileRevision: async () => null,
  getToolUsageStats: () => ({
    toolCounts: new Map(),
    toolResults: new Map(),
    lastToolUse: '',
    lastToolSuccess: false
  }),
  updateToolStats: () => {},
  tokenUsageConversation: {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0
  },
  addFileForMessage: () => ({ 
    filePath: '', 
    fileMetadata: {} as FileMetadata 
  }),
  addFilesForMessage: () => [],
  createFileContentBlocks: async () => null
};

Deno.test({
  name: "SearchProjectTool - Basic functionality",
  async fn() {
    const tool = new SearchProjectTool(
      'search_project',
      'Search project files',
      {},
      { async: true }
    );

    const result = await tool.runTool(
      mockConversationInteraction,
      {
        id: 'test-use',
        name: 'search_project',
        toolInput: {
          filePattern: '*.ts',
          contentPattern: 'function'
        }
      },
      mockProjectEditor
    );

    // Verify result structure
    assertEquals(typeof result.toolResults, 'string');
    assertEquals(typeof result.toolResponse, 'string');
    assertEquals(typeof result.bbResponse, 'string');
  }
});

Deno.test({
  name: "SearchProjectTool - Browser formatter",
  fn() {
    const tool = new SearchProjectTool(
      'search_project',
      'Search project files',
      {}
    );

    const result = tool.formatLogEntryToolUse(
      {
        filePattern: '*.ts',
        contentPattern: 'function',
        caseSensitive: true
      },
      'browser'
    );

    // Verify browser formatting
    assertEquals(typeof result.title, 'object'); // JSX.Element
    assertEquals(typeof result.content, 'object'); // JSX.Element
    assertEquals(typeof result.preview, 'string');
    assertStringIncludes(result.preview, 'function');
  }
});

Deno.test({
  name: "SearchProjectTool - Console formatter",
  fn() {
    const tool = new SearchProjectTool(
      'search_project',
      'Search project files',
      {}
    );

    const result = tool.formatLogEntryToolUse(
      {
        filePattern: '*.ts',
        contentPattern: 'function',
        caseSensitive: true
      },
      'console'
    );

    // Verify console formatting
    assertEquals(typeof result.title, 'string');
    assertEquals(typeof result.content, 'string');
    assertEquals(typeof result.preview, 'string');
    assertStringIncludes(result.preview, 'function');
  }
});

Deno.test({
  name: "SearchProjectTool - Input validation",
  fn() {
    const tool = new SearchProjectTool(
      'search_project',
      'Search project files',
      {}
    );

    // Valid input
    const validInput = {
      filePattern: '*.ts',
      contentPattern: 'function',
      caseSensitive: true
    };
    assertEquals(tool.validateInput(validInput), true);

    // Invalid input (invalid date format)
    const invalidInput = {
      filePattern: '*.ts',
      dateAfter: 'invalid-date'
    };
    assertEquals(tool.validateInput(invalidInput), false);
  }
});

Deno.test({
  name: "SearchProjectTool - Result formatting",
  fn() {
    const tool = new SearchProjectTool(
      'search_project',
      'Search project files',
      {}
    );

    const resultContent = 
      '2 files match the search criteria: content pattern "function"\n' +
      'src/file1.ts\nsrc/file2.ts';

    // Test browser formatting
    const browserResult = tool.formatLogEntryToolResult(
      resultContent,
      'browser'
    );
    assertEquals(typeof browserResult.title, 'object'); // JSX.Element
    assertEquals(typeof browserResult.content, 'object'); // JSX.Element
    assertStringIncludes(browserResult.preview, '2 files');

    // Test console formatting
    const consoleResult = tool.formatLogEntryToolResult(
      resultContent,
      'console'
    );
    assertEquals(typeof consoleResult.title, 'string');
    assertEquals(typeof consoleResult.content, 'string');
    assertStringIncludes(consoleResult.preview, '2 files');
  }
});