# Testing Guidelines for BB Tools

This document outlines testing requirements and best practices for the BB tools
package. Following these guidelines ensures consistent quality and reliability
across all tools.

## Core Principles

1. **Use Existing Tests as Templates**
   - Find similar tool tests to use as reference
   - Maintain consistent structure and style
   - Only modify what's necessary for new functionality

2. **Test File Structure**
   ```
   your-tool/
   └── tests/
       ├── mod.test.ts         # Core functionality tests
       ├── browser.test.ts     # Browser formatter tests
       └── console.test.ts     # Console formatter tests
   ```

3. **Test Coverage Requirements**
   - Basic functionality
   - Edge cases
   - Error scenarios
   - Input validation
   - Formatter output (browser and console)

## Writing Tests

### Basic Structure

```typescript
import { assertEquals, assertThrows } from "@std/assert";
import { withTestProject } from "../test_utils.ts";
import YourTool from "../mod.ts";

Deno.test({
  name: "YourTool - Basic functionality",
  async fn() {
    await withTestProject(async (projectEditor) => {
      const tool = new YourTool();
      // Test implementation
    });
  },
});
```

### Test Categories

1. **Core Functionality**
   ```typescript
   Deno.test({
     name: "YourTool - Successfully processes input",
     async fn() {
       await withTestProject(async (projectEditor) => {
         const tool = new YourTool();
         const result = await tool.runTool(
           mockInteraction,
           mockToolUse,
           projectEditor,
         );
         assertEquals(result.toolResults, expectedResults);
       });
     },
   });
   ```

2. **Input Validation**
   ```typescript
   Deno.test({
     name: "YourTool - Validates input correctly",
     fn() {
       const tool = new YourTool();
       const valid = tool.validateInput({
         validParam: "value",
       });
       assertEquals(valid, true);
     },
   });
   ```

3. **Error Handling**
   ```typescript
   Deno.test({
     name: "YourTool - Handles errors appropriately",
     async fn() {
       await withTestProject(async (projectEditor) => {
         const tool = new YourTool();
         await assertThrows(
           async () => {
             await tool.runTool(
               mockInteraction,
               invalidToolUse,
               projectEditor,
             );
           },
           Error,
           "Expected error message",
         );
       });
     },
   });
   ```

4. **Formatter Tests**
   ```typescript
   // Browser formatter
   Deno.test({
     name: "YourTool - Formats browser output correctly",
     fn() {
       const tool = new YourTool();
       const result = tool.formatLogEntryToolUse(
         mockInput,
         "browser",
       );
       // Assert JSX structure
     },
   });

   // Console formatter
   Deno.test({
     name: "YourTool - Formats console output correctly",
     fn() {
       const tool = new YourTool();
       const result = tool.formatLogEntryToolUse(
         mockInput,
         "console",
       );
       assertEquals(result, expectedConsoleOutput);
     },
   });
   ```

## Test Utilities

### Mock Objects

```typescript
// Mock conversation interaction
const mockInteraction: IConversationInteraction = {
  getFileMetadata: () => mockMetadata,
  readProjectFileContent: async () => mockContent,
  // ... other required methods
};

// Mock tool use
const mockToolUse: LLMAnswerToolUse = {
  id: "test-id",
  name: "your-tool",
  parameters: {
    // Tool-specific parameters
  },
};
```

### Test Project Setup

```typescript
export async function withTestProject(
  fn: (projectEditor: IProjectEditor) => Promise<void>,
) {
  const tempDir = await Deno.makeTempDir();
  try {
    const projectEditor = createTestProjectEditor(tempDir);
    await fn(projectEditor);
  } finally {
    await Deno.remove(tempDir, { recursive: true });
  }
}
```

## Testing Best Practices

1. **Test Organization**
   - Group related tests together
   - Use descriptive test names
   - Keep tests focused and atomic
   - Clean up resources properly

2. **Assertions**
   - Use appropriate assertion methods
   - Test exact values where possible
   - Include meaningful error messages
   - Test both positive and negative cases

3. **Resource Management**
   - Clean up temporary files
   - Close open handles
   - Use try/finally blocks
   - Handle async operations properly

4. **Mock Data**
   - Use realistic test data
   - Cover edge cases
   - Test with various input sizes
   - Include invalid data tests

## Running Tests

```bash
# Run all tests
deno test

# Run specific test file
deno test your-tool/tests/mod.test.ts

# Run tests with coverage
deno test --coverage
```

## Test Coverage Requirements

1. **Core Functionality**
   - All public methods tested
   - All parameters validated
   - Success cases covered
   - Error cases covered

2. **Edge Cases**
   - Boundary conditions
   - Invalid inputs
   - Resource limits
   - Timeout scenarios

3. **Integration Points**
   - File system interactions
   - Project editor usage
   - Conversation interaction
   - Resource management

4. **Formatting**
   - Browser output
   - Console output
   - Various content types
   - Error messages

## Continuous Integration

The package uses GitHub Actions for CI/CD:

1. Tests run on:
   - Pull requests
   - Main branch pushes
   - Release tags

2. Coverage reports are generated
3. Linting is performed
4. Type checking is verified

## See Also

- [CREATING_TOOLS.md](./CREATING_TOOLS.md) - Tool creation guide
- [README.md](../README.md) - Package overview
