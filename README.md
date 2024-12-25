# @beyondbetter/tools

Core tool infrastructure for building BB (Beyond Better) AI assistant tools. This package provides
the base classes, interfaces, and types needed to create tools that can be used with the BB AI
assistant.

## Features

- Base tool class with standardized interfaces
- Browser and console formatting with consistent styling
- Comprehensive type definitions
- Project and conversation management interfaces
- Built-in input validation using JSON Schema
- Extensive testing utilities
- Tool metadata and examples support

## Installation

```bash
# Using JSR
jsr add @beyondbetter/tools

# Using Deno
import { LLMTool } from "jsr:@beyondbetter/tools";
```

## Quick Start

1. Create tool structure:

```
my-tool/
├── tool.ts             # Main implementation
├── info.json          # Tool metadata
├── formatter.browser.tsx    # Browser formatting
├── formatter.console.ts     # Console formatting
└── tool.test.ts       # Tests
```

2. Define tool metadata (info.json):

```json
{
  "name": "my_tool",
  "description": "Description of my tool",
  "version": "1.0.0",
  "author": "BB Team",
  "license": "MIT",
  "examples": [
    {
      "description": "Example usage",
      "input": {
        "param1": "value1"
      }
    }
  ]
}
```

3. Implement the tool (tool.ts):

```typescript
import LLMTool, {
  type IConversationInteraction,
  type IProjectEditor,
  type LLMToolRunResult,
  type LLMAnswerToolUse
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
    const { param1 } = toolUse.toolInput;
    
    return {
      toolResults: \`Processed: \${param1}\`,
      toolResponse: "Tool executed successfully",
      bbResponse: { data: param1 }
    };
  }

  formatLogEntryToolUse(toolInput, format) {
    return format === "console"
      ? formatLogEntryToolUseConsole(toolInput)
      : formatLogEntryToolUseBrowser(toolInput);
  }

  formatLogEntryToolResult(resultContent, format) {
    return format === "console"
      ? formatLogEntryToolResultConsole(resultContent)
      : formatLogEntryToolResultBrowser(resultContent);
  }
}
```

4. Implement browser formatting (formatter.browser.tsx):

```typescript
/** @jsxImportSource preact */
import LLMTool, {
  type LLMToolInputSchema,
  type LLMToolLogEntryFormattedResult,
} from '@beyondbetter/tools';

export function formatLogEntryToolUse(
  toolInput: LLMToolInputSchema,
): LLMToolLogEntryFormattedResult {
  return {
    title: LLMTool.TOOL_TAGS_BROWSER.content.title('Tool Use', 'My Tool'),
    subtitle: LLMTool.TOOL_TAGS_BROWSER.content.subtitle('Processing...'),
    content: LLMTool.TOOL_TAGS_BROWSER.base.container(
      <>
        {LLMTool.TOOL_TAGS_BROWSER.base.label('Parameters')}
        {LLMTool.TOOL_TAGS_BROWSER.base.list([
          <>
            {LLMTool.TOOL_TAGS_BROWSER.base.label('Value:')}{' '}
            {LLMTool.TOOL_TAGS_BROWSER.content.text(toolInput.param1)}
          </>,
        ])}
      </>,
    ),
    preview: 'Processing input...',
  };
}
```

5. Implement console formatting (formatter.console.ts):

```typescript
import { stripIndents } from 'common-tags';
import LLMTool, {
  type LLMToolInputSchema,
  type LLMToolLogEntryFormattedResult,
} from '@beyondbetter/tools';

export function formatLogEntryToolUse(
  toolInput: LLMToolInputSchema,
): LLMToolLogEntryFormattedResult {
  return {
    title: LLMTool.TOOL_STYLES_CONSOLE.content.title('Tool Use', 'My Tool'),
    subtitle: LLMTool.TOOL_STYLES_CONSOLE.content.subtitle('Processing...'),
    content: stripIndents`
      ${LLMTool.TOOL_STYLES_CONSOLE.base.label('Parameters')}
      ${
      LLMTool.TOOL_STYLES_CONSOLE.base.listItem(
        stripIndents`
          ${LLMTool.TOOL_STYLES_CONSOLE.base.label('Value:')} 
          ${LLMTool.TOOL_STYLES_CONSOLE.content.text(toolInput.param1)}`,
      )
    }`,
    preview: 'Processing input...',
  };
}
```

6. Use the tool:

```typescript
const tool = new MyTool();
const result = await tool.runTool(
  conversationInteraction,
  {
    id: 'tool-use-1',
    name: 'my-tool',
    toolInput: {
      param1: 'test input',
    },
  },
  projectEditor,
);
```

## Documentation

- [Creating Tools](./docs/CREATING_TOOLS.md) - Detailed guide for creating new tools
- [Testing Guide](./docs/TESTING.md) - Testing requirements and guidelines
- [Tools Reference](./docs/tools.md) - Comprehensive tool framework documentation

## Core Interfaces

### LLMTool

Base class for all tools:

- Input validation using JSON Schema
- Standardized execution flow
- Consistent formatting for browser and console
- Resource management
- Tool metadata support

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

- [BB (Beyond Better)](https://github.com/beyondbetter/bb) - AI assistant using this tool framework
- [@beyondbetter/types](https://jsr.io/@beyondbetter/types) - Shared types for BB projects

## Support

- [GitHub Issues](https://github.com/beyondbetter/bb-tools/issues)
- [Documentation](https://github.com/beyondbetter/bb-tools/tree/main/docs)
