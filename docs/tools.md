# BB Plugin Framework Reference

This document provides a comprehensive reference for the BB plugin framework, including plugin structure,
tool types, interfaces, implementation patterns, and styling guidelines.

## Plugin Framework Overview

The BB plugin framework provides a structured way to create and distribute tools and datasources that can be used by AI assistants.

### Plugin Structure

Plugins are packaged as `.bbplugin` directories containing:
- **manifest.json**: Required plugin metadata
- **Tool components**: One or more `.tool` directories
- **Datasource components**: Optional `.datasource` directories (future support)

**Note**: Standalone `.tool` directories are deprecated but still supported for backward compatibility.

### Tool Components

Each tool within a plugin:
- Extends the `LLMTool` base class
- Implements specific interfaces
- Provides both browser and console formatting
- Includes comprehensive testing
- Contains tool metadata in info.json

## Core Components

### LLMTool Base Class

The foundation for all BB tools:

```typescript
abstract class LLMTool {
  constructor(
    public name: string,
    public description: string,
    public toolConfig: LLMToolConfig,
    public features: LLMToolFeatures = {},
  ) {}

  abstract get inputSchema(): LLMToolInputSchema;
  abstract runTool(
    interaction: IConversationInteraction,
    toolUse: LLMAnswerToolUse,
    projectEditor: IProjectEditor
  ): Promise<LLMToolRunResult>;
  abstract formatLogEntryToolUse(...): LLMToolLogEntryFormattedResult;
  abstract formatLogEntryToolResult(...): LLMToolLogEntryFormattedResult;
}
```

### Tool Features

Tools can declare supported features:

```typescript
interface LLMToolFeatures {
  mutates?: boolean; // Modifies resources
  stateful?: boolean; // Maintains state
  async?: boolean; // Runs asynchronously
  idempotent?: boolean; // Multiple runs produce same result
  resourceIntensive?: boolean; // Needs significant resources
  requiresNetwork?: boolean; // Needs internet access
}
```

### Tool Results

Tools return structured results:

```typescript
interface LLMToolRunResult {
  toolResults: LLMToolRunResultContent;
  toolResponse: LLMToolRunToolResponse;
  bbResponse: LLMToolRunBbResponse;
  finalizeCallback?: (messageId: string) => void;
}
```

## Tool Types

### 1. File System Tools

Tools that interact with the project's file system:

- Must validate paths with `isPathWithinProject`
- Should use `ProjectEditor` methods
- Need to handle file operations carefully
- Consider impact on project structure

Example:

```typescript
class FileSystemTool extends LLMTool {
  async runTool(
    interaction: IConversationInteraction,
    toolUse: LLMAnswerToolUse,
    projectEditor: IProjectEditor,
  ): Promise<LLMToolRunResult> {
    const { filePath } = toolUse.toolInput;
    if (!isPathWithinProject(projectEditor.projectRoot, filePath)) {
      throw new Error('Invalid path');
    }
    // Perform file operations
  }
}
```

### 2. Data Processing Tools

Tools that process or analyze data:

- Handle data validation
- Consider performance implications
- Implement proper error handling
- Support both synchronous and async operations

Example:

```typescript
class DataProcessingTool extends LLMTool {
  async runTool(
    interaction: IConversationInteraction,
    toolUse: LLMAnswerToolUse,
    projectEditor: IProjectEditor,
  ): Promise<LLMToolRunResult> {
    const { data } = toolUse.toolInput;
    // Process data
    return {
      toolResults: processedData,
      toolResponse: 'Data processed successfully',
      bbResponse: { data: processedData },
    };
  }
}
```

### 3. Network Tools

Tools that interact with external resources:

- Handle network errors
- Implement timeouts
- Consider rate limiting
- Validate external resources

Example:

```typescript
class NetworkTool extends LLMTool {
  features = {
    requiresNetwork: true,
    async: true,
  };

  async runTool(
    interaction: IConversationInteraction,
    toolUse: LLMAnswerToolUse,
    projectEditor: IProjectEditor,
  ): Promise<LLMToolRunResult> {
    const { url } = toolUse.toolInput;
    // Fetch external resource
  }
}
```

## Formatting

### Browser Formatting

Tools provide JSX-based formatting using TOOL_TAGS_BROWSER:

```typescript
/** @jsxImportSource preact */
import LLMTool from "@beyondbetter/tools";

formatLogEntryToolUse(toolInput: LLMToolInputSchema): LLMToolLogEntryFormattedResult {
  return {
    title: LLMTool.TOOL_TAGS_BROWSER.content.title('Tool Use', 'Your Tool'),
    subtitle: LLMTool.TOOL_TAGS_BROWSER.content.subtitle('Processing...'),
    content: LLMTool.TOOL_TAGS_BROWSER.base.container(
      <>
        {LLMTool.TOOL_TAGS_BROWSER.base.label('Parameters')}
        {LLMTool.TOOL_TAGS_BROWSER.base.list([
          <>
            {LLMTool.TOOL_TAGS_BROWSER.base.label('Parameter 1:')}
            {' '}
            {LLMTool.TOOL_TAGS_BROWSER.content.text('value')}
          </>,
          <>
            {LLMTool.TOOL_TAGS_BROWSER.base.label('Status:')}
            {' '}
            {LLMTool.TOOL_TAGS_BROWSER.content.status('completed', 'Done')}
          </>
        ])}
      </>
    ),
    preview: 'Tool execution preview'
  };
}
```

### Console Formatting

Tools provide text-based formatting using TOOL_STYLES_CONSOLE:

```typescript
import { stripIndents } from 'common-tags';
import LLMTool from "@beyondbetter/tools";

formatLogEntryToolUse(toolInput: LLMToolInputSchema): LLMToolLogEntryFormattedResult {
  return {
    title: LLMTool.TOOL_STYLES_CONSOLE.content.title('Tool Use', 'Your Tool'),
    subtitle: LLMTool.TOOL_STYLES_CONSOLE.content.subtitle('Processing...'),
    content: stripIndents`
      ${LLMTool.TOOL_STYLES_CONSOLE.base.label('Parameters')}
      ${LLMTool.TOOL_STYLES_CONSOLE.base.listItem(
        stripIndents`
          ${LLMTool.TOOL_STYLES_CONSOLE.base.label('Parameter 1:')} 
          ${LLMTool.TOOL_STYLES_CONSOLE.content.text('value')}`
      )}
      ${LLMTool.TOOL_STYLES_CONSOLE.base.listItem(
        stripIndents`
          ${LLMTool.TOOL_STYLES_CONSOLE.base.label('Status:')} 
          ${LLMTool.TOOL_STYLES_CONSOLE.content.status('completed', 'Done')}`
      )}`,
    preview: 'Tool execution preview'
  };
}
```

### Styling Components

#### Browser Components

- **Base Components**
  - `container`: Wraps content in a styled container
  - `label`: Displays a styled label
  - `list`: Creates a styled list of items
  - `text`: Basic text styling

- **Content Components**
  - `title`: Tool title with optional category
  - `subtitle`: Secondary title or description
  - `status`: Status indicators (completed, error, etc.)
  - `error`: Error message styling
  - `success`: Success message styling
  - `filename`: File path styling
  - `url`: URL styling
  - `date`: Date formatting
  - `size`: File size formatting
  - `boolean`: Boolean value formatting
  - `regex`: Regular expression formatting

#### Console Components

- **Base Components**
  - `label`: Styled text labels
  - `listItem`: Indented list items
  - `text`: Basic text styling

- **Content Components**
  - `title`: Tool title with optional category
  - `subtitle`: Secondary title or description
  - `status`: Status indicators
  - `error`: Error message styling
  - `success`: Success message styling
  - `filename`: File path styling
  - `url`: URL styling
  - `date`: Date formatting
  - `size`: File size formatting
  - `boolean`: Boolean value formatting
  - `regex`: Regular expression formatting

## Implementation Patterns

### 1. Input Validation

Use JSON Schema for input validation:

```typescript
get inputSchema(): LLMToolInputSchema {
  return {
    type: 'object',
    properties: {
      param1: { type: 'string' },
      param2: { type: 'number' }
    },
    required: ['param1']
  };
}
```

### 2. Error Handling

Implement consistent error handling:

```typescript
try {
  // Tool operations
} catch (error) {
  if (error instanceof SpecificError) {
    // Handle specific error
  } else {
    // Handle unknown error
  }
  throw error; // Let LLMToolManager handle it
}
```

### 3. Resource Management

Clean up resources properly:

```typescript
async runTool(...): Promise<LLMToolRunResult> {
  const resource = await acquireResource();
  try {
    // Use resource
    return result;
  } finally {
    await releaseResource(resource);
  }
}
```

## Best Practices

1. **Input Validation**
   - Use comprehensive JSON schemas
   - Validate early in tool execution
   - Provide clear error messages
   - Handle edge cases

2. **Error Handling**
   - Use structured error types
   - Provide detailed error messages
   - Clean up resources on error
   - Handle async errors properly

3. **Resource Management**
   - Track resource usage
   - Clean up properly
   - Handle cleanup errors
   - Use try/finally blocks

4. **Performance**
   - Consider operation cost
   - Implement timeouts
   - Handle large inputs
   - Cache when appropriate

5. **Formatting**
   - Use appropriate styling constants
   - Structure content logically
   - Handle error states consistently
   - Provide clear visual hierarchy
   - Use JSX fragments for browser components
   - Use stripIndents for console output
   - Include meaningful labels
   - Format specialized content types

## See Also

- [CREATING_TOOLS.md](./CREATING_TOOLS.md) - Detailed guide for creating tools
- [TESTING.md](./TESTING.md) - Testing requirements and guidelines
- [README.md](../README.md) - Package overview
