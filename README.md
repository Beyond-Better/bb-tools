# @beyondbetter/tools

[![JSR Scope](https://jsr.io/badges/@beyondbetter)](https://jsr.io/@beyondbetter)
[![JSR](https://jsr.io/badges/@beyondbetter/tools)](https://jsr.io/@beyondbetter/tools)
[![JSR Score](https://jsr.io/badges/@beyondbetter/tools/score)](https://jsr.io/@beyondbetter/tools)

Core plugin infrastructure for building BB (Beyond Better) AI assistant plugins. This package provides
the base classes, interfaces, types, and plugin structure needed to create plugins containing tools and
datasources that can be used with the BB AI assistant.

**Note**: This package may be renamed to `@beyondbetter/plugins` in the future.

## Features

- **Plugin Structure**: Structured `.bbplugin` format with manifest support
- **Multi-Component Support**: Package multiple tools and datasources together
- **Base Tool Class**: Standardized LLMTool base class with consistent interfaces
- **Dual Formatting**: Browser (JSX/Preact) and console (ANSI) output formatting
- **Type Safety**: Comprehensive TypeScript type definitions
- **Project & Conversation**: Standardized interfaces for file and conversation management
- **Input Validation**: Built-in JSON Schema validation
- **Testing Utilities**: Extensive testing helpers and utilities
- **Metadata Support**: Plugin and tool metadata with examples
- **Version Management**: Semantic versioning with BB compatibility checks
- **Distribution Ready**: Double-click installation support (.bbplugin files)

**Note**: Standalone `.tool` directories are deprecated but still supported for backward compatibility.

## Installation

```bash
# Using JSR
jsr add @beyondbetter/tools

# Using Deno
import { LLMTool } from "jsr:@beyondbetter/tools";
```

## Quick Start

### Plugin Structure

1. Create plugin package:

```
my-plugin.bbplugin/
├── manifest.json       # Plugin metadata (required)
└── my-tool.tool/      # Tool directory
    ├── tool.ts        # Main implementation
    ├── info.json      # Tool metadata
    ├── formatter.browser.tsx  # Browser formatting
    ├── formatter.console.ts   # Console formatting
    └── tool.test.ts   # Tests
```

2. Create plugin manifest (manifest.json):

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "Description of your plugin",
  "license": "MIT",
  "tools": ["my-tool.tool"],
  "datasources": [],
  "bbVersion": ">=0.9.0"
}
```

3. Define tool metadata (my-tool.tool/info.json):

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

4. Implement the tool (my-tool.tool/tool.ts):

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

5. Implement browser formatting (my-tool.tool/formatter.browser.tsx):

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

6. Implement console formatting (my-tool.tool/formatter.console.ts):

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

7. Install and use the plugin:

```bash
# Copy plugin to BB plugins directory
cp -r my-plugin.bbplugin ~/.config/bb/plugins/

# Or double-click the .bbplugin directory (macOS/Windows)
# BB will show installation dialog

# Restart BB API to load the plugin
```

8. Use the tool:

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

- [Creating Plugins](./docs/CREATING_TOOLS.md) - Detailed guide for creating new plugins
- [Testing Guide](./docs/TESTING.md) - Testing requirements and guidelines
- [Plugin Framework Reference](./docs/tools.md) - Comprehensive framework documentation
- [Plugin Manifest Schema](./docs/plugin-manifest-schema.json) - JSON schema for manifest.json
- [Guidelines](./GUIDELINES.md) - Framework development guidelines

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
3. Follow the [Creating Plugins](./docs/CREATING_TOOLS.md) guide
4. Follow the [Guidelines](./GUIDELINES.md) for framework development
5. Ensure tests pass using \`deno test\`
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
