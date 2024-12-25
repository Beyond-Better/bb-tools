# @beyondbetter/tools

Core tool infrastructure for building BB (Beyond Better) AI assistant tools.
This package provides the base classes, interfaces, and types needed to create
tools that can be used with the BB AI assistant.

## Features

- Base tool class with standardized interfaces
- Browser and console formatting support
- Comprehensive type definitions
- Project and conversation management interfaces
- Built-in input validation using JSON Schema
- Extensive testing utilities

## Installation

```bash
# Using JSR
jsr add @beyondbetter/tools

# Using Deno
import { LLMTool } from "jsr:@beyondbetter/tools";
```

## Quick Start

1. Create a new tool:

```typescript
import { LLMTool } from "@beyondbetter/tools";
import type { 
  IConversationInteraction,
  IProjectEditor,
  LLMToolRunResult,
  LLMAnswerToolUse 
} from "@beyondbetter/tools";

class MyTool extends LLMTool {
  constructor() {
    super(
      "my-tool",
      "Description of my tool",
      {}, // Tool config
      {
        mutates: false,
        async: true,
        requiresNetwork: false
      }
    );
  }

  get inputSchema() {
    return {
      type: "object",
      properties: {
        param1: { type: "string" }
      },
      required: ["param1"]
    };
  }

  async runTool(
    interaction: IConversationInteraction,
    toolUse: LLMAnswerToolUse,
    projectEditor: IProjectEditor
  ): Promise<LLMToolRunResult> {
    const { param1 } = toolUse.parameters;
    
    return {
      toolResults: \`Processed: \${param1}\`,
      toolResponse: "Tool executed successfully",
      bbResponse: { data: param1 }
    };
  }

  formatLogEntryToolUse(toolInput, format) {
    return format === "console"
      ? \`Using my-tool with: \${JSON.stringify(toolInput)}\`
      : <div>Using my-tool with: {JSON.stringify(toolInput)}</div>;
  }

  formatLogEntryToolResult(resultContent, format) {
    return format === "console"
      ? \`Result: \${JSON.stringify(resultContent)}\`
      : <div>Result: {JSON.stringify(resultContent)}</div>;
  }
}
```

2. Use the tool:

```typescript
const tool = new MyTool();
const result = await tool.runTool(
  conversationInteraction,
  {
    id: "tool-use-1",
    name: "my-tool",
    parameters: {
      param1: "test input",
    },
  },
  projectEditor,
);
```

## Documentation

- [Creating Tools](./docs/CREATING_TOOLS.md) - Detailed guide for creating new
  tools
- [Testing Guide](./docs/TESTING.md) - Testing requirements and guidelines
- [Tools Reference](./docs/tools.md) - Comprehensive tool framework
  documentation

## Core Interfaces

### LLMTool

Base class for all tools:

- Input validation using JSON Schema
- Standardized execution flow
- Formatting for browser and console
- Resource management

### IProjectEditor

Project management interface:

- File system access
- Change tracking
- Project configuration
- Resource management

### IConversationInteraction

Conversation management interface:

- File handling
- Tool usage tracking
- Token management
- Message formatting

## Contributing

1. Fork the repository
2. Create your feature branch
3. Follow the [Creating Tools](./docs/CREATING_TOOLS.md) guide
4. Ensure tests pass using \`deno test\`
5. Submit a pull request

## Testing

```bash
# Run all tests
deno test

# Run with coverage
deno test --coverage
```

See [Testing Guide](./docs/TESTING.md) for detailed testing requirements.

## License

MIT License - see LICENSE file for details.

## Related Projects

- [BB (Beyond Better)](https://github.com/beyondbetter/bb) - AI assistant using
  this tool framework
- [@beyondbetter/types](https://jsr.io/@beyondbetter/types) - Shared types for
  BB projects

## Support

- [GitHub Issues](https://github.com/beyondbetter/bb-tools/issues)
- [Documentation](https://github.com/beyondbetter/bb-tools/tree/main/docs)
