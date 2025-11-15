# Search Project Tool Example

This example demonstrates how to create a plugin and tool using the BB Plugin framework. It implements a file
search tool packaged within the `search-plugin.bbplugin` plugin that can search project files by content, name, date, and size.

**Plugin Structure**: This tool is part of the `search-plugin` plugin package, demonstrating the recommended `.bbplugin` structure with manifest.json.

## Overview

The search project tool shows how to:

- Structure a plugin using the `.bbplugin` format
- Create a manifest.json for plugin metadata
- Implement the LLMTool base class
- Use IProjectEditor and IConversationInteraction interfaces
- Create browser and console formatters
- Write comprehensive tests

## Implementation

### Plugin Structure

```
search-plugin.bbplugin/
├── manifest.json       # Plugin metadata (required)
└── search-project.tool/
    ├── tool.ts         # Main tool implementation
    ├── formatter.browser.tsx # Browser formatting
    ├── formatter.console.ts  # Console formatting
    ├── info.json       # Tool metadata
    ├── tool.test.ts    # Tests
    └── README.md       # Documentation
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
import { SearchProjectTool } from '@beyondbetter/tools/examples';

// Create tool instance
const tool = new SearchProjectTool(
  'search-project',
  'Search project files',
  {},
  { async: true },
);

// Use the tool
const result = await tool.runTool(
  conversationInteraction,
  {
    id: 'tool-use-1',
    name: 'search-project',
    toolInput: {
      filePattern: '*.ts',
      contentPattern: 'function',
      caseSensitive: true,
    },
  },
  projectEditor,
);
```

## Plugin Installation

```bash
# Copy plugin to BB plugins directory
cp -r search-plugin.bbplugin ~/.config/bb/plugins/

# Or double-click search-plugin.bbplugin (macOS/Windows)
# BB will show installation dialog

# Restart BB API to load the plugin
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
    title: tags.content.title('Tool Input', 'search-project'),
    content: <div>...</div>,
    preview: 'Preview text',
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
    title: styles.content.title('Tool Input', 'search-project'),
    content: '...',
    preview: 'Preview text',
  };
}
```

### Testing

The example includes tests for:

```typescript
// Basic functionality
Deno.test('SearchProjectTool - Basic functionality', async () => {
  // Test tool execution
});

// Input validation
Deno.test('SearchProjectTool - Input validation', () => {
  // Test schema validation
});

// Formatting
Deno.test('SearchProjectTool - Browser formatter', () => {
  // Test browser output
});

Deno.test('SearchProjectTool - Console formatter', () => {
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

- [Plugin Creation Guide](../../../docs/CREATING_TOOLS.md)
- [Testing Guide](../../../docs/TESTING.md)
- [Plugin Framework Reference](../../../docs/tools.md)
- [Plugin Manifest Schema](../../../docs/plugin-manifest-schema.json)
