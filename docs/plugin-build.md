# BB Plugin Build System

This document describes the build system for BB plugins, which transpiles TypeScript plugins to JavaScript for use with compiled BB binaries.

## Overview

BB plugins are written in TypeScript but need to be transpiled to JavaScript to work with compiled Deno binaries. The build system:

1. **Transpiles** all `.ts` and `.tsx` files to JavaScript (stripping type annotations)
2. **Copies** configuration files (`.json`, `.md`) as-is
3. **Preserves** the plugin directory structure
4. **Creates** two distributable files:
   - `.bbplugin` - Flat contents for programmatic/GUI installation
   - `.bbplugin.zip` - Nested directory structure for manual installation

## Why Transpilation is Needed

When BB API is compiled with `deno compile`, the resulting binary:
- Cannot dynamically import TypeScript files (`.ts`)
- Can only import JavaScript files (`.js`)
- Does not include the TypeScript compiler

In development mode:
- BB loads `.ts` files directly
- Deno's runtime transpiles TypeScript on the fly

In production/compiled mode:
- BB looks for `.js` files first, falls back to `.ts`
- Plugins must be pre-transpiled to JavaScript

## Plugin Structure

### Before Build (Source)
```
my-tools.bbplugin/
├── manifest.json                    # Plugin metadata
├── my-tools_search.tool/
│   ├── tool.ts                      # Tool implementation (TypeScript)
│   ├── types.ts                     # Type definitions
│   ├── formatter.console.ts         # Console formatter
│   ├── formatter.browser.tsx        # Browser formatter (JSX)
│   ├── tool.test.ts                 # Tests (skipped in build)
│   ├── info.json                    # Tool metadata
│   └── README.md                    # Documentation
├── fetch_definitions.tool/
│   ├── tool.ts
│   ├── ...
└── utils/
    ├── rateLimiter.ts
    └── definitionsParser.ts
```

### After Build (Distributable)
```
dist/plugins/
├── my-tools.bbplugin.build/         # Build directory
│   ├── manifest.json                # Copied as-is
│   ├── my-tools_search.tool/
│   │   ├── tool.js                  # Transpiled from tool.ts
│   │   ├── types.js                 # Transpiled from types.ts
│   │   ├── formatter.console.js     # Transpiled
│   │   ├── formatter.browser.tsx    # Copied (for browser use)
│   │   ├── info.json                # Copied as-is
│   │   └── README.md                # Copied as-is
│   ├── fetch_definitions.tool/
│   │   ├── tool.js
│   │   ├── ...
│   └── utils/
│       ├── rateLimiter.js
│       └── definitionsParser.js
├── my-tools.bbplugin                # Programmatic install (flat zip)
└── my-tools.bbplugin.zip            # Manual install (nested directory)
```

## Building a Plugin

### Using deno task (Recommended)

```bash
# Build with default settings (output to dist/plugins)
deno task build:plugin my-tools.bbplugin

# Build with custom output directory
deno task build:plugin my-tools.bbplugin my-plugins

# Build with verbose output
deno task build:plugin my-tools.bbplugin --verbose

# Build without creating zip file
deno task build:plugin my-tools.bbplugin --no-zip

# Dev build - includes both .ts and .js files
deno task build:plugin my-tools.bbplugin --dev-build

# Combine options
deno task build:plugin my-tools.bbplugin --dev-build --verbose
```

### Using script directly

```bash
deno run --allow-read --allow-write --allow-env --allow-net \
  scripts/build-plugin.ts my-tools.bbplugin
```

### Build Output

The build script will:

1. **Transpile TypeScript files** (`.ts`, `.tsx` → `.js`)
   - Strips type annotations
   - Preserves imports and code structure
   - Does NOT bundle dependencies
   - Target: ES2022
   - Production mode: Outputs only `.js` files
   - Dev mode (`--dev-build`): Outputs both `.ts` and `.js` files

2. **Copy configuration files**
   - `manifest.json` - Plugin metadata
   - `info.json` - Tool metadata
   - `README.md` - Documentation
   - `.tsx` files - Browser formatters (kept as-is)

3. **Skip test files**
   - Files ending in `.test.ts` or `.test.tsx`

4. **Create distribution archives**
   
   Two files are created:
   
   **a) `{plugin-name}.bbplugin`** (Programmatic Install)
   - Contains **only the plugin contents** at zip root level
   - Format: Standard zip format with `.bbplugin` extension
   - Compatible with DUI auto-installer (file association)
   - For GUI-based or automated installation
   
   **b) `{plugin-name}.bbplugin.zip`** (Manual Install)
   - Contains a `{plugin-name}.bbplugin/` directory with all files inside
   - Format: Standard `.zip` format
   - Users can extract to get ready-to-use plugin directory
   - For manual installation by copying to plugins folder
   
   Both use JSZip for cross-platform compatibility and are ready for distribution

## How BB Loads Plugins

The `llmToolManager.ts` detects which file format to use:

```typescript
// Check if .js exists (transpiled), otherwise use .ts (source)
const jsPath = join(basePath, 'tool.js');
const tsPath = join(basePath, 'tool.ts');

let toolPath: string;
try {
  await Deno.stat(jsPath);
  toolPath = jsPath;  // Use transpiled version
} catch {
  toolPath = tsPath;  // Fall back to TypeScript
}
```

This means:
- **Development mode**: Uses `.ts` files directly (no build needed)
- **Production mode**: Uses `.js` files if available, falls back to `.ts`
- **Compiled binary**: Requires `.js` files (cannot import `.ts`)

## Plugin Development Workflow

### During Development

1. Write plugin in TypeScript
2. Test with development API (no build needed)
3. Use `deno task dev:api` to run uncompiled API

```bash
# No build needed - TypeScript works directly
deno task dev:api
```

### Before Distribution

1. Build the plugin to JavaScript
2. Test with compiled API binary
3. Distribute both archive files

```bash
# Build plugin
deno task build:plugin my-tools.bbplugin

# Test with compiled API
./dist/bb-api  # or bb-api.exe on Windows

# Distribute both files
# - dist/plugins/my-tools.bbplugin (for GUI installer)
# - dist/plugins/my-tools.bbplugin.zip (for manual install)
```

## Troubleshooting

### Error: "Unexpected token '{'"

**Cause**: Compiled API trying to import TypeScript file

**Solution**: Build the plugin to JavaScript

```bash
deno task build:plugin your-plugin.bbplugin
```

### Error: "Module not found"

**Cause**: Import paths in plugin don't match file structure

**Solution**: 
- Check import paths in your `.ts` files
- Ensure JSR imports use correct versions
- Verify `import_map.json` is correct

### Build Fails with Transform Errors

**Cause**: Invalid TypeScript syntax

**Solution**:
- Check TypeScript syntax
- Run `deno check` on your plugin files
- Use `--verbose` flag to see detailed errors

```bash
deno task build:plugin your-plugin.bbplugin --verbose
```

### Zip Creation Fails

**Cause**: JSZip library error or file system permissions

**Solution**: 
- Check file system permissions for output directory
- Ensure sufficient disk space
- Try with `--verbose` flag for detailed error messages

**Note**: The build script uses JSZip (JavaScript library) for cross-platform compatibility, no system `zip` command required.

## Technical Details

### Transpilation Process

The build script uses **esbuild's transform API**:

```typescript
const result = await esbuild.transform(code, {
  loader: 'ts',        // Parse as TypeScript
  format: 'esm',       // Output ES modules
  target: 'es2022',    // Target ES2022
  platform: 'neutral', // No platform-specific transforms
  minify: false,       // Keep readable
  keepNames: true,     // Preserve function/class names
  treeShaking: false,  // Don't remove code
});
```

Key points:
- **No bundling**: Each file transpiled separately
- **Imports preserved**: All import statements kept as-is
- **No minification**: Output remains readable
- **ES2022 target**: Modern JavaScript features

### Why Full Bundling?

**Everything is bundled**:
- JSR packages (like `@beyondbetter/tools`, `@std/*`)
- NPM packages (if used)
- Third-party libraries (like `deno-dom`)
- Plugin's internal imports

**Only truly built-in APIs are external**:
- Deno namespace (`Deno.*`)
- Standard JavaScript APIs (`console`, `fetch`, etc.)
- Web APIs (`URL`, `Blob`, etc.)

**Reasons**:
1. **Compiled binaries can't download modules** at runtime
2. **No deno.json import maps** available in compiled mode
3. **JSR/NPM resolution doesn't work** in compiled binaries
4. **Each tool must be self-contained** with all dependencies
5. **Larger files, but guaranteed to work** everywhere

### File Type Handling

#### Production Build (default)

| Extension | Action | Reason |
|-----------|--------|--------|
| `.ts` | Transpile to `.js` | TypeScript code |
| `.tsx` | Transpile to `.js` AND copy as `.tsx` | JSX for browser |
| `.json` | Copy as-is | Configuration data |
| `.md` | Copy as-is | Documentation |
| `.test.ts` | Skip | Tests not needed in distribution |

#### Dev Build (--dev-build flag)

| Extension | Action | Reason |
|-----------|--------|--------|
| `.ts` | Transpile to `.js` AND copy `.ts` | Both source and transpiled |
| `.tsx` | Transpile to `.js` AND copy as `.tsx` | JSX for browser |
| `.json` | Copy as-is | Configuration data |
| `.md` | Copy as-is | Documentation |
| `.test.ts` | Skip | Tests not needed in distribution |

**When to use dev build**:
- Distributing to developers who want source code access
- Plugin will be used in both dev and compiled environments
- Debugging or modification of source is anticipated
- Larger file size acceptable for convenience

**When to use production build**:
- Distributing to end users via DUI
- Minimizing plugin size
- Source code access not required
- Only compiled binary support needed

## Adding Build Task to deno.json

Add this to your root `deno.json`:

```json
{
  "tasks": {
    "build:plugin": "deno run --allow-read --allow-write --allow-env --allow-net scripts/build-plugin.ts"
  }
}
```

## Future Enhancements

### Planned Improvements

1. **Watch mode**: Rebuild on file changes
2. **Validation**: Verify plugin structure before build
3. **Type checking**: Run `deno check` during build
4. **Dependency bundling**: Optional bundling for self-contained plugins
5. **Multiple formats**: Support different output targets

### Plugin Manifest Schema

Future versions may support build configuration in `manifest.json`:

```json
{
  "name": "my-tools",
  "version": "1.0.2",
  "build": {
    "target": "es2022",
    "minify": false,
    "bundle": false,
    "exclude": ["*.test.ts", "docs/**"]
  }
}
```

## References

- [Deno Compile Limitations](https://docs.deno.com/runtime/reference/cli/compiler/)
- [esbuild Transform API](https://esbuild.github.io/api/#transform)
- [BB Plugin System](../plugins/README.md)
