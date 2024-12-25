# Creating Tools for BB

This guide provides comprehensive instructions for creating new tools in the BB
ecosystem. It covers the entire process from planning to implementation and
testing.

## Overview

When creating a new tool:

1. Use an existing tool as a template
2. Follow established patterns and conventions
3. Maintain consistent structure and style
4. Implement comprehensive testing

## Step-by-Step Guide

1. **Choose a Reference Tool**
   - Select an existing tool similar to your planned functionality
   - Use it as a template throughout development

2. **Gather Information**
   ```typescript
   // Information Template
   {
     toolName: string;           // Descriptive name
     description: string;        // Brief purpose
     inputSchema: JSONSchema4;   // Parameter definitions
     expectedOutput: string;     // What tool returns
     requiredActions: string[];  // Main functionality
     errorScenarios: string[];   // Error handling cases
   }
   ```

3. **Create Tool Structure**
   ```
   your-tool/
   ├── tool.ts             # Main tool implementation
   ├── info.json          # Tool metadata and examples
   ├── formatter.browser.tsx    # Browser-specific formatting
   ├── formatter.console.ts     # Console-specific formatting
   └── tool.test.ts       # Tool tests
   ```

4. **Create Tool Metadata**
   ```json
   {
     "name": "your_tool",
     "description": "Detailed description of your tool...",
     "version": "1.0.0",
     "author": "BB Team",
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

5. **Implement Core Components**

   ```typescript
   import LLMTool, {
     type IConversationInteraction,
     type IProjectEditor,
     type LLMToolInputSchema,
     type LLMToolLogEntryFormattedResult,
     type LLMToolRunResult,
     type LLMAnswerToolUse
   } from "@beyondbetter/tools";

   class YourTool extends LLMTool {
     get inputSchema() {
       return {
         type: "object",
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

6. **Implement Formatters**

   Browser (formatter.browser.tsx):
   ```typescript
   /** @jsxImportSource preact */
   import LLMTool, {
     type LLMToolInputSchema,
     type LLMToolLogEntryFormattedResult
   } from "@beyondbetter/tools";

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
         </>
       ),
       preview: 'Tool execution preview'
     };
   }
   ```

   Console (formatter.console.ts):
   ```typescript
   import { stripIndents } from 'common-tags';
   import LLMTool, {
     type LLMToolInputSchema,
     type LLMToolLogEntryFormattedResult
   } from "@beyondbetter/tools";

   export function formatLogEntryToolUse(
     toolInput: LLMToolInputSchema,
   ): LLMToolLogEntryFormattedResult {
     return {
       title: LLMTool.TOOL_STYLES_CONSOLE.content.title('Tool Use', 'Your Tool'),
       subtitle: LLMTool.TOOL_STYLES_CONSOLE.content.subtitle('Processing...'),
       content: stripIndents`
         ${LLMTool.TOOL_STYLES_CONSOLE.base.label('Parameters')}
         ${LLMTool.TOOL_STYLES_CONSOLE.base.list([
           // Format parameters
         ]).join('\n')}`,
       preview: 'Tool execution preview'
     };
   }
   ```

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

## Best Practices

1. **Code Organization**
   - Keep related code together
   - Use clear file structure (tool.ts, info.json, formatters)
   - Follow naming conventions
   - Maintain consistent formatting

2. **Implementation**
   - Follow existing patterns
   - Keep methods focused
   - Handle errors gracefully
   - Clean up resources

3. **Testing**
   - Write comprehensive tests
   - Test edge cases
   - Test error scenarios
   - Maintain test consistency

4. **Documentation**
   - Keep docs up to date
   - Include examples in info.json
   - Document errors
   - Explain complex logic

5. **Formatting**
   - Use TOOL_TAGS_BROWSER for browser output
   - Use TOOL_STYLES_CONSOLE for console output
   - Use JSX fragments (<>...</>) for browser components
   - Use stripIndents for console formatting
   - Provide clear labels and structure
   - Handle success and error states consistently

## See Also

- [README.md](../README.md) - Package overview
- [TESTING.md](./TESTING.md) - Testing guidelines
- [tools.md](./tools.md) - Tool reference