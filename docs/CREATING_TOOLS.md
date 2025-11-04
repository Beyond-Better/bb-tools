# Creating BB Plugins

This guide provides comprehensive instructions for creating new plugins for the Beyond Better (BB) ecosystem. Each plugin can contain one or more tools and/or datasources, packaged in a structured `.bbplugin` directory.

## Overview

BB plugins use a structured directory format that enables:
- Easy distribution and installation
- Multiple tools and datasources in a single package
- Clear metadata and versioning
- OS-level file association for double-click installation

**Note**: The standalone `.tool` directory structure is deprecated but still supported. All new development should use the `.bbplugin` structure.

## Plugin Structure

### Basic Plugin Package

```
your-plugin.bbplugin/
├── manifest.json          # Required: Plugin metadata
├── your-tool.tool/       # Tool directory
│   ├── tool.ts          # Tool implementation
│   ├── info.json        # Tool metadata
│   ├── formatter.browser.tsx    # Browser formatting
│   ├── formatter.console.ts     # Console formatting
│   └── tool.test.ts     # Tool tests
└── another-tool.tool/   # Additional tools (optional)
    ├── tool.ts
    ├── info.json
    ├── formatter.browser.tsx
    ├── formatter.console.ts
    └── tool.test.ts
```

### Multi-Component Plugin

```
advanced-plugin.bbplugin/
├── manifest.json          # Required: Plugin metadata
├── search-tool.tool/     # Tool component
│   ├── tool.ts
│   ├── info.json
│   └── ...
└── api-datasource.datasource/  # Datasource component (future support)
    ├── datasource.ts
    ├── info.json
    └── ...
```

## Step-by-Step Guide

1. **Choose a Reference Plugin**
   - Select an existing plugin similar to your planned functionality
   - Use it as a template throughout development

2. **Gather Information**
   ```typescript
   // Plugin Planning Template
   {
     pluginName: string;         // Plugin package name
     version: string;            // Semantic version
     description: string;        // Plugin purpose
     author: string;            // Creator name
     license: string;           // License type
     tools: {
       toolName: string;        // Tool name
       description: string;     // Tool purpose
       inputSchema: JSONSchema4; // Parameters
       expectedOutput: string;  // Return value
       requiredActions: string[]; // Functionality
       errorScenarios: string[]; // Error cases
     }[];
     datasources?: {...}[];     // Future datasource components
   }
   ```

3. **Create Plugin Package Structure**
   ```bash
   mkdir -p your-plugin.bbplugin/your-tool.tool
   ```

4. **Create Plugin Manifest** (`manifest.json`)
   ```json
   {
     "name": "your-plugin",
     "version": "1.0.0",
     "author": "Your Name",
     "description": "A collection of useful tools for...",
     "license": "MIT",
     "tools": ["your-tool.tool", "another-tool.tool"],
     "datasources": [],
     "bbVersion": ">=0.9.0"
   }
   ```
   See [Plugin Manifest Schema](#plugin-manifest-schema) for complete specification.

5. **Create Tool Metadata** (`your-tool.tool/info.json`)
   ```json
   {
     "name": "your_tool",
     "description": "Detailed description of your tool...",
     "version": "1.0.0",
     "author": "Your Name",
     "license": "MIT",
     "examples": [
       {
         "description": "Example usage description",
         "input": {
           "param1": "value1"
         }
       }
     ]
   }
   ```

6. **Implement Core Components**

   ```typescript
   import LLMTool, {
     type IConversationInteraction,
     type IProjectEditor,
     type LLMAnswerToolUse,
     type LLMToolInputSchema,
     type LLMToolLogEntryFormattedResult,
     type LLMToolRunResult,
   } from '@beyondbetter/tools';

   class YourTool extends LLMTool {
     get inputSchema() {
       return {
         type: 'object',
         properties: {
           // Define parameters
         },
         required: [],
       };
     }

     async runTool(
       interaction: IConversationInteraction,
       toolUse: LLMAnswerToolUse,
       projectEditor: IProjectEditor,
     ): Promise<LLMToolRunResult> {
       // Implement tool functionality
     }

     formatLogEntryToolUse(toolInput, format) {
       return format === 'console'
         ? formatLogEntryToolUseConsole(toolInput)
         : formatLogEntryToolUseBrowser(toolInput);
     }

     formatLogEntryToolResult(resultContent, format) {
       return format === 'console'
         ? formatLogEntryToolResultConsole(resultContent)
         : formatLogEntryToolResultBrowser(resultContent);
     }
   }
   ```

7. **Implement Formatters**

   Browser (formatter.browser.tsx):
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
       title: LLMTool.TOOL_TAGS_BROWSER.content.title('Tool Use', 'Your Tool'),
       subtitle: LLMTool.TOOL_TAGS_BROWSER.content.subtitle('Processing...'),
       content: LLMTool.TOOL_TAGS_BROWSER.base.container(
         <>
           {LLMTool.TOOL_TAGS_BROWSER.base.label('Parameters')}
           {LLMTool.TOOL_TAGS_BROWSER.base.list([
             // Format parameters
           ])}
         </>,
       ),
       preview: 'Tool execution preview',
     };
   }
   ```

   Console (formatter.console.ts):
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
       title: LLMTool.TOOL_STYLES_CONSOLE.content.title('Tool Use', 'Your Tool'),
       subtitle: LLMTool.TOOL_STYLES_CONSOLE.content.subtitle('Processing...'),
       content: stripIndents`
         ${LLMTool.TOOL_STYLES_CONSOLE.base.label('Parameters')}
         ${
         LLMTool.TOOL_STYLES_CONSOLE.base.list([
           // Format parameters
         ]).join('\n')
       }`,
       preview: 'Tool execution preview',
     };
   }
   ```

## Plugin Manifest Schema

The `manifest.json` file is required at the root of every `.bbplugin` package. It provides metadata about the plugin and lists all included components.

### Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "BB Plugin Manifest",
  "type": "object",
  "required": ["name", "version", "description", "tools"],
  "properties": {
    "name": {
      "type": "string",
      "description": "Plugin package name (kebab-case recommended)",
      "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$",
      "examples": ["my-plugin", "search-tools"]
    },
    "version": {
      "type": "string",
      "description": "Semantic version number",
      "pattern": "^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9.-]+)?(\\+[a-zA-Z0-9.-]+)?$",
      "examples": ["1.0.0", "2.1.0-beta.1"]
    },
    "author": {
      "type": "string",
      "description": "Plugin creator name or organization",
      "examples": ["Your Name", "Your Organization"]
    },
    "description": {
      "type": "string",
      "description": "Brief description of plugin functionality",
      "minLength": 10,
      "maxLength": 500
    },
    "license": {
      "type": "string",
      "description": "License identifier (SPDX format recommended)",
      "examples": ["MIT", "Apache-2.0", "GPL-3.0"]
    },
    "tools": {
      "type": "array",
      "description": "List of tool directories included in plugin",
      "items": {
        "type": "string",
        "pattern": "^[a-z0-9_-]+\\.tool$",
        "examples": ["search-tool.tool", "format-tool.tool"]
      },
      "minItems": 0
    },
    "datasources": {
      "type": "array",
      "description": "List of datasource directories included in plugin",
      "items": {
        "type": "string",
        "pattern": "^[a-z0-9_-]+\\.datasource$",
        "examples": ["api-datasource.datasource"]
      },
      "minItems": 0,
      "default": []
    },
    "bbVersion": {
      "type": "string",
      "description": "Minimum BB version required (semver range)",
      "examples": [">=0.9.0", "^1.0.0"],
      "default": ">=0.9.0"
    },
    "homepage": {
      "type": "string",
      "format": "uri",
      "description": "Plugin homepage or repository URL"
    },
    "repository": {
      "type": "object",
      "description": "Repository information",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["git", "svn", "hg"]
        },
        "url": {
          "type": "string",
          "format": "uri"
        }
      }
    },
    "keywords": {
      "type": "array",
      "description": "Keywords for plugin discovery",
      "items": {
        "type": "string"
      }
    }
  }
}
```

### Example Manifests

**Simple Plugin with One Tool:**
```json
{
  "name": "search-plugin",
  "version": "1.0.0",
  "author": "John Doe",
  "description": "Advanced search capabilities for BB",
  "license": "MIT",
  "tools": ["search-tool.tool"],
  "datasources": [],
  "bbVersion": ">=0.9.0"
}
```

**Multi-Tool Plugin:**
```json
{
  "name": "dev-tools",
  "version": "2.1.0",
  "author": "Dev Team",
  "description": "Collection of development utilities",
  "license": "Apache-2.0",
  "tools": [
    "search-tool.tool",
    "format-tool.tool",
    "lint-tool.tool"
  ],
  "datasources": [],
  "bbVersion": ">=1.0.0",
  "homepage": "https://github.com/user/dev-tools",
  "keywords": ["development", "utilities", "formatting"]
}
```

**Plugin with Tools and Datasources:**
```json
{
  "name": "api-integration",
  "version": "1.5.0",
  "author": "API Corp",
  "description": "Tools and datasources for API integration",
  "license": "MIT",
  "tools": ["api-query.tool", "api-test.tool"],
  "datasources": ["rest-api.datasource"],
  "bbVersion": ">=0.9.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/apicorp/bb-api-integration"
  }
}
```

### Validation Requirements

1. **Plugin Name**: Must be kebab-case, lowercase alphanumeric with hyphens
2. **Version**: Must follow semantic versioning (major.minor.patch)
3. **Component Lists**: All listed tools/datasources must exist as directories
4. **Directory Names**: Must match the pattern in manifest exactly
5. **BB Version**: Should specify minimum compatible version

## Tool Types and Considerations

### File Manipulation Tools

- Always validate paths with `isPathWithinProject`
- Use `ProjectEditor` methods when possible
- Handle file operations carefully
- Consider impact on project structure

### Data Retrieval Tools

- Implement proper error handling
- Consider performance implications
- Handle rate limiting where applicable
- Validate and sanitize inputs

### System Command Tools

- Implement proper timeouts
- Sanitize inputs carefully
- Handle errors gracefully
- Consider security implications

## Error Handling

1. Use structured error types
   ```typescript
   if (!isPathWithinProject(path)) {
     throw new Error(`Access denied: ${path} is outside project`);
   }
   ```

2. Provide clear error messages
3. Handle both expected and unexpected errors
4. Clean up resources in error cases

## Testing Requirements

See [TESTING.md](./TESTING.md) for detailed testing guidelines. Key points:

1. Create comprehensive tests
2. Test both success and failure cases
3. Test formatters for both browser and console
4. Follow existing test patterns
5. Clean up test resources properly

## Documentation

1. Include JSDoc comments
   ```typescript
   /**
    * Performs specific tool functionality
    * @param {string} input - Description of input
    * @returns {Promise<r>} Description of result
    * @throws {Error} Description of error cases
    */
   ```

2. Update tool documentation
3. Include usage examples
4. Document error scenarios

## Plugin Distribution and Installation

### Installation Methods

1. **Double-Click Installation** (macOS/Windows)
   - Users can double-click `.bbplugin` files
   - OS file association opens BB DUI
   - Installation dialog shows plugin details
   - Plugin copied to configured directory
   - Requires BB API restart to load

2. **Manual Installation**
   - Copy `.bbplugin` directory to plugin directory
   - Default locations:
     - macOS: `~/.config/bb/plugins`
     - Windows: `%APPDATA%/bb/plugins`
     - Linux: `~/.config/bb/plugins`
   - Custom locations via `config.yaml`:
     ```yaml
     api:
       userPluginDirectories:
         - ./my-plugins
         - /absolute/path/to/plugins
     ```

3. **Plugin Discovery**
   - BB scans plugin directories on startup
   - Loads tools from: `plugins/*.bbplugin/*.tool`
   - Also supports legacy: `plugins/*.tool` (deprecated)
   - Tools registered with LLM for use

### Version Management

- Plugin versions follow semantic versioning
- BB detects version conflicts during installation
- Warns on downgrades or duplicate versions
- Users can choose to upgrade/replace existing plugins

### Packaging for Distribution

1. **Prepare Package**
   - Ensure all files are present
   - Validate manifest.json
   - Test all tools locally
   - Include README.md with usage instructions

2. **Distribution Options**
   - Direct file sharing (`.bbplugin` directory)
   - Archive formats (`.zip`, `.tar.gz`)
   - Version control repositories
   - Future: BB plugin marketplace

3. **Best Practices**
   - Include comprehensive documentation
   - Provide usage examples
   - List dependencies and requirements
   - Specify BB version compatibility
   - Include license information

## Best Practices

1. **Plugin Organization**
   - Group related tools in a single plugin
   - Use clear, descriptive plugin names
   - Keep manifest.json accurate and complete
   - Version plugins semantically
   - Document all included components

2. **Code Organization**
   - Keep related code together within each tool
   - Use clear file structure (tool.ts, info.json, formatters)
   - Follow naming conventions (kebab-case for directories)
   - Maintain consistent formatting across all tools
   - Separate tool-specific types into types.ts

3. **Implementation**
   - Follow existing patterns from example tools
   - Keep methods focused and single-purpose
   - Handle errors gracefully with clear messages
   - Clean up resources properly
   - Consider performance implications

4. **Testing**
   - Write comprehensive tests for each tool
   - Test edge cases and boundary conditions
   - Test error scenarios thoroughly
   - Maintain test consistency across plugin
   - Test installation and discovery process

5. **Documentation**
   - Keep manifest.json and info.json up to date
   - Include examples in tool info.json files
   - Document errors and edge cases
   - Explain complex logic with comments
   - Provide plugin-level README with overview

6. **Formatting**
   - Use TOOL_TAGS_BROWSER for browser output
   - Use TOOL_STYLES_CONSOLE for console output
   - Use JSX fragments (<>...</>) for browser components
   - Use stripIndents for console formatting
   - Provide clear labels and structure
   - Handle success and error states consistently

7. **Compatibility**
   - Specify minimum BB version in manifest
   - Test with target BB versions
   - Avoid BB internal APIs unless necessary
   - Handle version differences gracefully
   - Document any version-specific features

## Legacy Tool Structure (Deprecated)

**Note**: The standalone `.tool` directory structure is deprecated. While BB still supports it for backward compatibility, all new development should use the `.bbplugin` structure.

### Old Structure (Deprecated)
```
plugins/
├── search-tool.tool/      # Standalone tool (deprecated)
│   ├── tool.ts
│   ├── info.json
│   └── ...
└── format-tool.tool/      # Another standalone tool (deprecated)
    ├── tool.ts
    └── ...
```

### New Structure (Current)
```
plugins/
├── search-plugin.bbplugin/    # Plugin package (current)
│   ├── manifest.json
│   ├── search-tool.tool/
│   │   ├── tool.ts
│   │   └── ...
│   └── format-tool.tool/
│       ├── tool.ts
│       └── ...
└── other-plugin.bbplugin/     # Another plugin
    ├── manifest.json
    └── ...
```

### Migration Notes

**Why Migrate?**
- Improved organization and discoverability
- Support for multiple components (tools + datasources)
- Better version management
- Enable double-click installation
- Prepare for plugin marketplace
- Future: digital signatures and security

**Migration Steps:**
1. Create new `.bbplugin` directory
2. Move `.tool` directories into plugin directory
3. Create `manifest.json` with metadata
4. Test plugin discovery and loading
5. Update distribution method

**Backward Compatibility:**
- BB continues to discover standalone `.tool` directories
- No immediate migration required
- Consider migration for new features and better UX

## See Also

- [README.md](../README.md) - Package overview
- [TESTING.md](./TESTING.md) - Testing guidelines
- [tools.md](./tools.md) - Tool reference
- [Plugin Installation Guide](https://github.com/beyond-better/bb) - BB plugin installation documentation
