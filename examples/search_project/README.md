# Search Project Tool Example

This example demonstrates how to create a tool using the BB Tools framework. It implements a file search tool that can search project files by content, name, date, and size.

## Overview

The search project tool shows how to:
- Implement the LLMTool base class
- Use IProjectEditor and IConversationInteraction interfaces
- Create browser and console formatters
- Write comprehensive tests

## Implementation

### Tool Structure
```
search_project/
├── mod.ts              # Main tool implementation
├── formatter.browser.tsx # Browser formatting
├── formatter.console.ts  # Console formatting
├── mod.test.ts        # Tests
└── README.md          # Documentation
```

### Key Features

1. **Input Schema**
   - Content pattern (regex)
   - File pattern (glob)
   - Date range filtering
   - Size range filtering
   - Case sensitivity option

2. **Formatting**
   - Browser formatting with JSX
   - Console formatting with ANSI colors
   - Consistent styling using framework utilities

3. **Testing**
   - Interface mocking
   - Input validation
   - Formatter testing
   - Error handling

## Usage

```typescript
import { SearchProjectTool } from "@beyondbetter/tools/examples/search_project";

// Create tool instance
const tool = new SearchProjectTool(
  'search_project',
  'Search project files',
  {},
  { async: true }
);

// Use the tool
const result = await tool.runTool(
  conversationInteraction,
  {
    id: 'tool-use-1',
    name: 'search_project',
    toolInput: {
      filePattern: '*.ts',
      contentPattern: 'function',
      caseSensitive: true
    }
  },
  projectEditor
);
```

## Implementation Details

### Input Validation

The tool validates input using JSON Schema:
```typescript
get inputSchema(): LLMToolInputSchema {
  return {
    type: 'object',
    properties: {
      contentPattern: {
        type: 'string',
        description: '...'
      },
      // ... other properties
    }
  };
}
```

### Formatting

Browser formatting with JSX:
```typescript
export function formatLogEntryToolUse(
  toolInput: LLMToolInputSchema,
): LLMToolLogEntryFormattedResult {
  // ... format using JSX
  return {
    title: tags.content.title('Tool Input', 'search_project'),
    content: <div>...</div>,
    preview: 'Preview text'
  };
}
```

Console formatting with ANSI:
```typescript
export function formatLogEntryToolUse(
  toolInput: LLMToolInputSchema,
): LLMToolLogEntryFormattedResult {
  // ... format using ANSI styles
  return {
    title: styles.content.title('Tool Input', 'search_project'),
    content: '...',
    preview: 'Preview text'
  };
}
```

### Testing

The example includes tests for:
```typescript
// Basic functionality
Deno.test("SearchProjectTool - Basic functionality", async () => {
  // Test tool execution
});

// Input validation
Deno.test("SearchProjectTool - Input validation", () => {
  // Test schema validation
});

// Formatting
Deno.test("SearchProjectTool - Browser formatter", () => {
  // Test browser output
});

Deno.test("SearchProjectTool - Console formatter", () => {
  // Test console output
});
```

## Best Practices Demonstrated

1. **Interface Usage**
   - Uses IProjectEditor for file operations
   - Uses IConversationInteraction for context
   - Follows interface contracts strictly

2. **Type Safety**
   - Strong typing throughout
   - Proper type exports
   - Interface compliance

3. **Error Handling**
   - Input validation
   - Operation errors
   - Clear error messages

4. **Testing**
   - Comprehensive test coverage
   - Interface mocking
   - Format testing
   - Error scenarios

5. **Documentation**
   - Clear usage examples
   - Implementation details
   - Type information

## See Also

- [Tool Creation Guide](../../docs/CREATING_TOOLS.md)
- [Testing Guide](../../docs/TESTING.md)
- [Tool Reference](../../docs/tools.md)