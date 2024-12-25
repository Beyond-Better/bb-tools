# BB Tools Reference

This document provides a comprehensive reference for the BB tools framework,
including tool types, interfaces, and implementation patterns.

## Tool Framework Overview

The BB tools framework provides a structured way to create tools that can be
used by AI assistants. Each tool:

- Extends the `LLMTool` base class
- Implements specific interfaces
- Provides both browser and console formatting
- Includes comprehensive testing

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
    const { filePath } = toolUse.parameters;
    if (!isPathWithinProject(projectEditor.projectRoot, filePath)) {
      throw new Error("Invalid path");
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
    const { data } = toolUse.parameters;
    // Process data
    return {
      toolResults: processedData,
      toolResponse: "Data processed successfully",
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
    const { url } = toolUse.parameters;
    // Fetch external resource
  }
}
```

## Formatting

### Browser Formatting

Tools provide JSX-based formatting for browser display:

```typescript
interface LLMToolLogEntryFormattedResult {
  title: string | JSX.Element;
  subtitle?: string | JSX.Element;
  content: string | JSX.Element;
  preview: string | JSX.Element;
}

// Example implementation
formatLogEntryToolUse(toolInput: LLMToolInputSchema, format: 'browser'): JSX.Element {
  return (
    <div class={LLMTool.TOOL_STYLES_BROWSER.tool}>
      <span class={LLMTool.TOOL_TAGS_BROWSER.tool}>
        {this.name}
      </span>
      {/* Tool-specific formatting */}
    </div>
  );
}
```

### Console Formatting

Tools also provide text-based formatting for console output:

```typescript
formatLogEntryToolUse(toolInput: LLMToolInputSchema, format: 'console'): string {
  const styles = LLMTool.TOOL_STYLES_CONSOLE;
  return `${styles.tool}Tool: ${this.name}${styles.reset}
Parameters:
${JSON.stringify(toolInput, null, 2)}`;
}
```

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

## See Also

- [CREATING_TOOLS.md](./CREATING_TOOLS.md) - Detailed guide for creating tools
- [TESTING.md](./TESTING.md) - Testing requirements and guidelines
- [README.md](../README.md) - Package overview
