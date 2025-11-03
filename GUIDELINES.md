---
title: BB Tools Framework Guidelines
project: bb-tools
version: 1.0.0
created: 2025-11-02
updated: 2025-11-02
purpose: Guidelines for LLM collaboration on bb-tools framework development
---

# BB Tools Framework Guidelines

## Project Purpose and Scope

### Overview
bb-tools (@beyondbetter/tools) is the core framework/library for building tools that work with the Beyond Better (BB) AI assistant. This project provides base classes, interfaces, types, and utilities needed to create properly structured BB tools.

**IMPORTANT**: These guidelines are for working on the bb-tools framework itself, NOT for users/consumers of the framework. The audience is the LLM assisting with framework development, maintenance, and enhancement.

### Project Goals
- Provide robust base classes (LLMTool) for tool creation
- Define standardized interfaces (IProjectEditor, IConversationInteraction)
- Supply formatting utilities for browser (JSX/Preact) and console (ANSI)
- Maintain comprehensive type definitions
- Demonstrate best practices through working examples
- Enable publishing to JSR for Deno ecosystem

### Expected Outcomes
- Clean, maintainable TypeScript code following Deno standards
- Clear documentation for framework consumers
- Working example tools that demonstrate framework capabilities
- Type-safe interfaces and implementations
- Consistent code organization and structure

### Project Scope
**In Scope:**
- Framework core classes and utilities
- Type definitions and interfaces
- Example tools demonstrating framework usage
- Documentation for tool creators
- JSR publishing configuration

**Out of Scope:**
- Individual tools created by framework consumers
- Beyond Better (BB) main application code
- Tool runtime environment (handled by BB)
- Tool distribution/marketplace

## Available Data Sources and Resources

### Data Source Configuration
**Primary Data Source**: `bb-tools` (filesystem)
- **Type**: Filesystem
- **Capabilities**: Read, Write, Delete
- **Root**: `$WORKING_DIR/bb-tools`
- **Access**: Full read/write access to all files and directories

### Resource Organization

#### Core Framework Files (Root Directory)
```
mod.ts              # Main module exports
llm_tool.ts         # LLMTool base class implementation
llm_tool_tags.tsx   # Browser/console formatting utilities (JSX)
types.ts            # Core type definitions
project_editor.ts   # IProjectEditor interface and types
conversation.ts     # IConversationInteraction interface
message.ts          # Message formatting utilities
```

#### Configuration Files
```
deno.json           # Deno project configuration & JSR publish settings
import_map.json     # Import mappings
deno.lock           # Dependency lock file
.gitignore          # Git ignore patterns
```

#### Documentation (`docs/`)
```
CREATING_TOOLS.md   # Guide for tool creators (consumers)
TESTING.md          # Testing guidelines for tools
tools.md            # Comprehensive framework reference
```

#### Example Tools (`examples/`)
```
mod.ts              # Examples module exports
search_project.tool/
  ├── tool.ts                   # Tool implementation
  ├── formatter.browser.tsx     # Browser formatting
  ├── formatter.console.ts      # Console formatting
  ├── info.json                 # Tool metadata
  ├── types.ts                  # Tool-specific types
  ├── tool.test.ts              # Tool tests
  └── README.md                 # Tool documentation
open_in_browser.tool/
  └── (same structure)
```

#### Other Files
```
README.md           # Project README
GUIDELINES.md       # Project Guidelines (this file)
LICENSE             # MIT License
.github/workflows/  # GitHub Actions (JSR publishing)
```

### Resource Access Patterns

1. **Framework Core Modifications**
   - Read existing implementation first
   - Consider backward compatibility
   - Update type definitions if interfaces change
   - Test with example tools after changes

2. **Example Tool Development**
   - Follow established tool structure
   - Include all standard files (tool.ts, formatters, tests, README, info.json)
   - Use framework utilities consistently
   - Demonstrate specific framework features

3. **Documentation Updates**
   - Keep in sync with code changes
   - Update examples when APIs change
   - Maintain consistency across all docs
   - Reference actual code examples

4. **Configuration Changes**
   - Verify JSR publish settings in deno.json
   - Update version numbers appropriately
   - Maintain import map consistency

## Development Standards

### Language and Runtime
- **Language**: TypeScript (Deno flavor)
- **Runtime**: Deno (required dependency)
- **Style**: Standard Deno TypeScript conventions
- **Module System**: ES modules with explicit extensions

### Code Organization

1. **File Naming**
   - Use lowercase with underscores: `llm_tool.ts`
   - Browser formatters: `formatter.browser.tsx` (JSX/Preact)
   - Console formatters: `formatter.console.ts`
   - Tests: `tool.test.ts` or `*.test.ts`
   - Types: `types.ts` (when tool-specific types needed)

2. **Module Exports**
   - Export public API through `mod.ts`
   - Use explicit exports, avoid wildcard re-exports when clarity is needed
   - Maintain clean separation of concerns

3. **Type Safety**
   - Strong typing throughout
   - Explicit return types for public methods
   - Proper interface implementation
   - No `any` types without justification

### Testing Standards

**Framework Core**: 
- No tests currently exist for the framework itself
- Framework reliability demonstrated through example tools

**Example Tools**: 
- Each example tool MUST include comprehensive tests
- Test files: `tool.test.ts`
- Test coverage should include:
  - Basic functionality
  - Input validation
  - Browser formatter output
  - Console formatter output
  - Error handling
- Use Deno's built-in test framework
- Mock interfaces (IProjectEditor, IConversationInteraction) as needed

### Publishing
- Published to JSR (JavaScript Registry)
- Version management in `deno.json`
- GitHub Actions workflow handles publishing
- Follow semantic versioning

## Tool Creation Guidelines

### Standard Tool Structure
When creating example tools or documenting tool patterns:

```
tool_name.tool/
├── tool.ts                   # Tool implementation (extends LLMTool)
├── formatter.browser.tsx     # Browser UI formatting (JSX/Preact)
├── formatter.console.ts      # Console output formatting (ANSI)
├── info.json                 # Tool metadata and examples
├── types.ts                  # Tool-specific types (if needed)
├── tool.test.ts              # Comprehensive tests
└── README.md                 # Tool documentation
```

### Key Implementation Requirements

1. **Tool Class**
   - Extend `LLMTool` base class
   - Implement `inputSchema` getter (JSON Schema)
   - Implement `runTool` method
   - Implement `formatLogEntryToolUse` and `formatLogEntryToolResult`
   - Set tool features using `LLMToolFeatures` interface:
     - `mutates`: boolean - Tool modifies resources
     - `stateful`: boolean - Tool maintains state between calls
     - `async`: boolean - Tool runs asynchronously
     - `idempotent`: boolean - Multiple runs produce same result
     - `resourceIntensive`: boolean - Tool needs significant resources
     - `requiresNetwork`: boolean - Tool needs internet access

2. **Browser Formatter** (`formatter.browser.tsx`)
   - Use Preact JSX syntax
   - Import: `/** @jsxImportSource preact */`
   - Use `LLMTool.TOOL_TAGS_BROWSER` utilities
   - Return `LLMToolLogEntryFormattedResult` with title, subtitle, content, preview

3. **Console Formatter** (`formatter.console.ts`)
   - Use ANSI color codes via framework utilities
   - Use `LLMTool.TOOL_STYLES_CONSOLE` utilities
   - Use `common-tags` stripIndents for clean formatting
   - Return `LLMToolLogEntryFormattedResult` with title, subtitle, content, preview

4. **Info File** (`info.json`)
   - Include: name, description, version, author, license
   - Provide usage examples with sample inputs
   - Document expected behavior

5. **Tests** (`tool.test.ts`)
   - Test tool execution
   - Validate input schema
   - Test both formatters
   - Cover error scenarios

### Tool Types and Patterns

When creating or working with tools, understand these common patterns:

**1. File System Tools**
- Tools that interact with project files
- MUST validate paths with `isPathWithinProject` utility
- Should use `ProjectEditor` methods for file operations
- Need careful error handling for file operations
- Consider impact on project structure

Example pattern:
```typescript
if (!isPathWithinProject(projectEditor.projectRoot, filePath)) {
  throw new Error(`Access denied: ${filePath} is outside project`);
}
```

**2. Data Processing Tools**
- Tools that process or analyze data
- Handle data validation early
- Consider performance implications for large datasets
- Implement proper error handling
- Support both sync and async operations

**3. Network Tools**
- Tools that interact with external resources
- Set `requiresNetwork: true` in features
- Handle network errors gracefully
- Implement timeouts
- Consider rate limiting
- Validate external resources

### Tool Results Structure

Tools return `LLMToolRunResult` with these components:
```typescript
interface LLMToolRunResult {
  toolResults: LLMToolRunResultContent;     // Main results
  toolResponse: LLMToolRunToolResponse;     // Response message
  bbResponse: LLMToolRunBbResponse;         // BB-specific data
  finalizeCallback?: (messageId: string) => void;  // Optional cleanup
}
```

### Tool Planning Template

When planning a new tool (for documentation or discussion), use this template:
```typescript
{
  toolName: string;           // Descriptive name
  description: string;        // Brief purpose
  inputSchema: JSONSchema4;   // Parameter definitions
  expectedOutput: string;     // What tool returns
  requiredActions: string[];  // Main functionality
  errorScenarios: string[];   // Error handling cases
}
```

### Framework Utilities

When working with framework code, understand these key utilities:

**1. TOOL_TAGS_BROWSER** (JSX formatting for browser UI)

*Base Components:*
- `container`: Wraps content in styled container
- `label`: Displays styled label text
- `list`: Creates styled list of items
- `listItem`: Individual list item styling
- `text`: Basic text styling

*Content Components:*
- `title`: Tool title with optional category
- `subtitle`: Secondary title or description
- `status`: Status indicators (completed, error, etc.)
- `error`: Error message styling
- `success`: Success message styling
- `filename`: File path styling
- `url`: URL styling
- `code`: Code snippet styling
- `date`: Date formatting
- `size`: File size formatting
- `boolean`: Boolean value formatting
- `regex`: Regular expression formatting

**2. TOOL_STYLES_CONSOLE** (ANSI formatting for console output)

*Base Components:*
- `label`: Styled text labels
- `listItem`: Indented list items with bullets
- `text`: Basic text styling

*Content Components:*
- `title`: Tool title with optional category
- `subtitle`: Secondary title or description
- `status`: Status indicators with colors
- `error`: Error message styling (red)
- `success`: Success message styling (green)
- `filename`: File path styling
- `url`: URL styling
- `code`: Code snippet styling
- `date`: Date formatting
- `size`: File size formatting
- `boolean`: Boolean value formatting
- `regex`: Regular expression formatting

**3. Core Interfaces**
- `IProjectEditor`: File operations, project context, path validation
- `IConversationInteraction`: Conversation management, file handling
- `LLMToolInputSchema`: JSON Schema for input validation
- `LLMToolRunResult`: Standardized tool output structure
- `LLMToolFeatures`: Tool capability declarations

## Restrictions and Guardrails

### Security and Privacy
- No specific security or privacy concerns for this project
- Framework is for tool creation, not for handling sensitive data
- Tools created with framework may have their own security requirements

### Approval Requirements
- No approval required for changes
- Human user (cng) is sole maintainer
- Implement requested changes directly
- Suggest improvements proactively

### File Modification Guidelines
- All files are modifiable (no read-only restrictions)
- Always review current content before modifications
- Consider backward compatibility for framework changes
- Update related files when making changes (e.g., types + implementation)

### Breaking Changes
When suggesting or implementing changes that affect the public API:
1. Clearly identify the breaking change
2. Explain impact on existing tools
3. Suggest migration path if needed
4. Consider version bump requirements

## Collaboration Workflow

### Decision Making

**Ask the human user when:**
- Requirements are unclear or ambiguous
- Multiple valid approaches exist with different tradeoffs
- Breaking changes would affect framework consumers
- Significant architectural decisions are needed
- Uncertainty about project direction or priorities

**Proceed autonomously when:**
- Implementing specific, clear requests
- Fixing obvious bugs or typos
- Improving code clarity or documentation
- Following established patterns
- Making non-breaking enhancements

### Suggestion Guidelines

**Always suggest when you identify:**
- Better/easier solutions the human may have missed
- Performance improvements
- Code clarity enhancements
- Consistency improvements across the codebase
- Potential issues or edge cases
- Opportunities to reduce duplication

**Suggestion format:**
1. Acknowledge the request
2. Present the suggested alternative
3. Explain the benefits
4. Ask for preference if uncertain

### Change Implementation

**Batching vs Incremental:**
- Use whichever approach makes sense for the task
- **Batch changes** when: Multiple related files need updates, refactoring across the codebase, consistent pattern application
- **Incremental changes** when: Iterating on design, testing changes step-by-step, complex modifications with checkpoints
- Discuss approach if uncertain

**Change Process:**
1. Load and review current file content
2. Show planned changes in thinking
3. Implement complete, working changes
4. Update related files if needed (types, docs, examples)
5. Suggest testing approach

### Code Review Mindset

When reviewing or modifying framework code:
- Consider how tool creators will use this API
- Think about edge cases and error handling
- Maintain consistency with existing patterns
- Prioritize clarity over cleverness
- Document complex logic
- Consider performance for common operations

## Common Tasks and Patterns

### Adding a New Framework Feature

1. **Identify scope**: Core class, interface, utility, or type
2. **Check existing patterns**: Follow established conventions
3. **Update implementation**: Add the feature
4. **Update types**: Ensure type safety
5. **Update documentation**: Reflect new capability
6. **Consider examples**: Should example tools demonstrate this?
7. **Test with examples**: Verify examples still work

### Creating a New Example Tool

1. **Create directory**: `examples/tool_name.tool/`
2. **Implement tool.ts**: Extend LLMTool, implement required methods
3. **Create formatters**: Both browser.tsx and console.ts
4. **Add info.json**: Metadata and examples
5. **Write tests**: Comprehensive coverage
6. **Document in README**: Usage and implementation details
7. **Export from examples/mod.ts**: Make available to framework users

### Updating Documentation

1. **Identify affected docs**: README, docs/*, example READMEs
2. **Update code examples**: Ensure accuracy
3. **Verify consistency**: Cross-reference related documentation
4. **Check completeness**: All new features documented?
5. **Update version**: If significant doc changes

### Refactoring Framework Code

1. **Plan the refactor**: Identify scope and goals
2. **Check example usage**: How do examples use current API?
3. **Make changes**: Implement refactoring
4. **Update examples**: Ensure examples still work
5. **Update types**: Reflect any interface changes
6. **Update docs**: Document new patterns
7. **Verify exports**: Check mod.ts exports

## Framework-Specific Considerations

### Understanding the Framework Architecture

**Core Concepts:**
- **LLMTool**: Base class providing common functionality
- **IProjectEditor**: Interface for file/project operations (consumed by tools)
- **IConversationInteraction**: Interface for conversation context (consumed by tools)
- **Formatters**: Dual formatting for browser UI and console output
- **Tool Metadata**: info.json provides tool information to BB

**Tool Lifecycle:**
1. Tool registered with BB
2. LLM decides to use tool based on capabilities
3. BB validates input against `inputSchema`
4. Tool's `runTool` method executes
5. Results formatted for display (browser or console)
6. Results returned to LLM

### Maintaining Backward Compatibility

When modifying the framework:
- Existing tools should continue to work without changes
- Add new optional parameters rather than breaking existing ones
- Deprecate features rather than removing them suddenly
- Provide clear migration paths for breaking changes
- Consider semantic versioning implications

### JSR Publishing Considerations

- Package published to `@beyondbetter/tools`
- Version in `deno.json` must be bumped for releases
- Ensure all exports in `mod.ts` are intentional
- No private implementation details should leak through exports
- GitHub Actions handles publishing on push to main

## Common Pitfalls and Solutions

### TypeScript/Deno Specifics

**Pitfall**: Forgetting file extensions in imports
```typescript
// ❌ Wrong
import { LLMTool } from './llm_tool';

// ✅ Correct
import { LLMTool } from './llm_tool.ts';
```

**Pitfall**: Mixing JSX without proper setup
```typescript
// ❌ Wrong - missing JSX directive
import { h } from 'preact';

// ✅ Correct
/** @jsxImportSource preact */
import type { JSX } from 'preact';
```

### Framework Usage

**Pitfall**: Not implementing all required methods
```typescript
// ❌ Wrong - missing formatters
class MyTool extends LLMTool {
  get inputSchema() { /* ... */ }
  async runTool() { /* ... */ }
  // Missing: formatLogEntryToolUse, formatLogEntryToolResult
}

// ✅ Correct - all methods implemented
class MyTool extends LLMTool {
  get inputSchema() { /* ... */ }
  async runTool() { /* ... */ }
  formatLogEntryToolUse() { /* ... */ }
  formatLogEntryToolResult() { /* ... */ }
}
```

**Pitfall**: Inconsistent formatting utilities
```typescript
// ❌ Wrong - using raw JSX without utilities
return <div style="color: blue">{text}</div>;

// ✅ Correct - using framework utilities
return LLMTool.TOOL_TAGS_BROWSER.content.text(text);
```

### Testing

**Pitfall**: Not mocking interfaces properly
```typescript
// ❌ Wrong - using real implementations
const tool = new MyTool();
await tool.runTool(realInteraction, toolUse, realEditor);

// ✅ Correct - mocking interfaces
const mockInteraction = {
  projectEditor: mockEditor,
  conversationLogger: mockLogger,
  // ... other required properties
};
await tool.runTool(mockInteraction, toolUse, mockEditor);
```

**Pitfall**: Not using test utilities
```typescript
// ❌ Wrong - manual temp directory management
const tempDir = await Deno.makeTempDir();
try {
  // test code
} finally {
  await Deno.remove(tempDir, { recursive: true });
}

// ✅ Correct - using withTestProject helper
import { withTestProject } from '@beyondbetter/tools/testing';

await withTestProject(async (projectEditor) => {
  // test code - cleanup handled automatically
});
```

### Resource Management

**Pitfall**: Not cleaning up resources
```typescript
// ❌ Wrong - no cleanup on error
async runTool() {
  const resource = await acquireResource();
  // operations that might throw
  await releaseResource(resource);
}

// ✅ Correct - cleanup with try/finally
async runTool() {
  const resource = await acquireResource();
  try {
    // operations
    return result;
  } finally {
    await releaseResource(resource);
  }
}```

## Quick Reference

### Essential Commands
```bash
# Run tests
deno test

# Run specific test file
deno test examples/search_project.tool/tool.test.ts

# Run tests with coverage
deno test --coverage

# Format code
deno fmt

# Lint code
deno lint

# Check types
deno check mod.ts
```

### File Templates

**Minimal Tool Implementation:**
See `examples/search_project.tool/` for complete reference implementation.

**Minimal Test with Test Utilities:**
```typescript
import { assertEquals } from '@std/assert';
import { withTestProject } from '@beyondbetter/tools/testing';
import { MyTool } from './tool.ts';

Deno.test({
  name: 'MyTool - basic functionality',
  async fn() {
    await withTestProject(async (projectEditor) => {
      const tool = new MyTool();
      const mockInteraction = {
        projectEditor,
        // ... other required properties
      };
      const result = await tool.runTool(
        mockInteraction,
        mockToolUse,
        projectEditor
      );
      assertEquals(result.toolResults, expectedResults);
    });
  },
});
```

**Mock Objects Pattern:**
```typescript
// Mock conversation interaction
const mockInteraction: IConversationInteraction = {
  getFileMetadata: () => mockMetadata,
  readProjectFileContent: async () => mockContent,
  // ... other required methods
};

// Mock tool use
const mockToolUse: LLMAnswerToolUse = {
  id: 'test-id',
  name: 'your-tool',
  toolInput: {
    // Tool-specific parameters
  },
};
```

### Key Framework Exports
```typescript
// From mod.ts
export { default as LLMTool } from './llm_tool.ts';
export type {
  IConversationInteraction,
  IProjectEditor,
  LLMToolInputSchema,
  LLMToolRunResult,
  LLMAnswerToolUse,
  // ... other types
} from './types.ts';
```

## Related Resources

### Internal Documentation
- `README.md` - Project overview and quick start
- `docs/CREATING_TOOLS.md` - Comprehensive guide for tool creators
- `docs/TESTING.md` - Testing guidelines and best practices
- `docs/tools.md` - Framework reference documentation
- `examples/search_project.tool/README.md` - Example tool walkthrough

### External Resources
- [JSR Package](https://jsr.io/@beyondbetter/tools) - Published package
- [Beyond Better](https://github.com/beyond-better/bb) - Main BB project
- [Deno Documentation](https://deno.land/manual) - Deno runtime docs
- [Preact Documentation](https://preactjs.com/) - JSX framework for browser formatting

### Related BB Projects
- `@beyondbetter/types` - Shared types across BB projects
- Beyond Better main application - Tool runtime environment

## Testing Reference

### Test Coverage Requirements

Each example tool must test:
1. **Core functionality** - All public methods
2. **Input validation** - Schema compliance
3. **Edge cases** - Boundary conditions, invalid inputs
4. **Error handling** - Expected errors, resource limits
5. **Formatters** - Both browser and console output
6. **Styling** - Proper use of TOOL_TAGS_BROWSER and TOOL_STYLES_CONSOLE

### Test Utilities

**withTestProject**: Helper for temporary project setup
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

### Formatter Testing Pattern

```typescript
// Browser formatter test
Deno.test({
  name: 'MyTool - Browser formatter',
  fn() {
    const tool = new MyTool();
    const result = tool.formatLogEntryToolUse(mockInput, 'browser');
    
    // Verify structure
    assertEquals(
      result.title,
      LLMTool.TOOL_TAGS_BROWSER.content.title('Tool Use', 'My Tool')
    );
    
    // Verify content components
    const content = result.content as JSX.Element;
    assertNotEquals(
      content.props.children.find(
        (child) => child.type === LLMTool.TOOL_TAGS_BROWSER.base.label
      ),
      undefined
    );
  },
});

// Console formatter test
Deno.test({
  name: 'MyTool - Console formatter',
  fn() {
    const tool = new MyTool();
    const result = tool.formatLogEntryToolUse(mockInput, 'console');
    
    // Verify structure
    assertEquals(
      result.title,
      LLMTool.TOOL_STYLES_CONSOLE.content.title('Tool Use', 'My Tool')
    );
    
    // Verify styled content
    assertStringIncludes(
      result.content,
      LLMTool.TOOL_STYLES_CONSOLE.base.label('Parameters')
    );
  },
});
```

## Version History

### 1.0.1 (2025-11-02)
- Enhanced with details from docs/CREATING_TOOLS.md
- Added tool types and patterns (File System, Data Processing, Network)
- Expanded styling components reference
- Added tool planning template
- Included testing utilities (withTestProject)
- Added comprehensive formatter testing patterns
- Included resource management best practices

### 1.0.0 (2025-11-02)
- Initial guidelines created
- Documented framework structure and development standards
- Established collaboration workflow
- Defined testing and publishing processes