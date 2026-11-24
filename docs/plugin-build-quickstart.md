# Plugin Build Quick Start

Quick reference for building BB plugins.

## TL;DR

```bash
# Build a plugin
deno task build:plugin my-tools.bbplugin

# Output will be in:
# - dist/plugins/my-tools.bbplugin.build/ (transpiled files - build directory)
# - dist/plugins/my-tools.bbplugin (programmatic install - flat zip with .bbplugin extension)
# - dist/plugins/my-tools.bbplugin.zip (manual install - contains my-tools.bbplugin/ directory)
```

## Why Build?

**Problem**: Compiled BB binaries cannot import TypeScript files (`.ts`)

**Solution**: Build transpiles TypeScript to JavaScript (`.js`)

**When to build**:
- ✅ Before distributing a plugin
- ✅ Before testing with compiled BB binary
- ❌ NOT needed during development (TypeScript works directly)

## Build Options

```bash
# Standard build (production - .js only)
deno task build:plugin <plugin-dir>

# Dev build (includes both .ts and .js files)
deno task build:plugin <plugin-dir> --dev-build

# Custom output directory
deno task build:plugin <plugin-dir> <output-dir>

# Verbose output (see what's being processed)
deno task build:plugin <plugin-dir> --verbose

# Skip zip creation (just transpile)
deno task build:plugin <plugin-dir> --no-zip

# Combine options
deno task build:plugin <plugin-dir> --dev-build --verbose
```

## What Gets Built?

### Production Build (default)

| File Type | Action | Output |
|-----------|--------|--------|
| `.ts` | Transpiled | `.js` |
| `.tsx` | Transpiled + Copied | `.js` + `.tsx` |
| `.json` | Copied | `.json` |
| `.md` | Copied | `.md` |
| `.test.ts` | Skipped | (not included) |

### Dev Build (--dev-build)

| File Type | Action | Output |
|-----------|--------|--------|
| `.ts` | Transpiled + Copied | `.js` + `.ts` |
| `.tsx` | Transpiled + Copied | `.js` + `.tsx` |
| `.json` | Copied | `.json` |
| `.md` | Copied | `.md` |
| `.test.ts` | Skipped | (not included) |

**Use dev build when**:
- Distributing to developers who want source code
- Plugin will be used in both compiled and dev environments
- Source code access is needed for debugging

**Use production build when**:
- Distributing to end users
- Smaller file size preferred
- Only compiled binary support needed

## Development Workflow

### 1. During Development (No Build Needed)

```bash
# Start dev API (loads TypeScript directly)
deno task start-api-dev

# Your plugin works without building
# Edit TypeScript files, they reload automatically
```

### 2. Before Distribution

```bash
# Build plugin to JavaScript
deno task build:plugin my-tools.bbplugin

# Test with compiled API
./dist/bb-api  # or bb-api.exe

# Distribute the .bbplugin file
# dist/plugins/my-tools.bbplugin
```

## Common Errors

### "Unexpected token '{'" when loading plugin

**Cause**: Compiled API trying to import TypeScript file

**Fix**: Build the plugin

```bash
deno task build:plugin your-plugin.bbplugin
```

### Build fails with "Failed to transpile"

**Cause**: TypeScript syntax error

**Fix**: Check your TypeScript code

```bash
# Check types first
deno check your-plugin.bbplugin/**/*.ts

# Then build with verbose output
deno task build:plugin your-plugin.bbplugin --verbose
```

## How It Works

1. **BB checks for `.js` first**, falls back to `.ts`
2. **Dev mode**: Uses `.ts` files (Deno transpiles on-the-fly)
3. **Compiled mode**: Uses `.js` files (pre-transpiled)

See [plugin-build.md](./plugin-build.md) for detailed documentation.

## Testing Both Modes

```bash
# Test with dev API (uses .ts files)
deno task start-api-dev

# Build plugin
deno task build:plugin my-tools.bbplugin

# Test with compiled API (uses .js files)
./dist/bb-api

# Both should work identically!
```

## Distribution Checklist

- [ ] Plugin works in dev mode
- [ ] All tests pass (`deno test`)
- [ ] Build succeeds without errors
- [ ] Plugin works with compiled BB binary
- [ ] Version number updated in `manifest.json`
- [ ] Distribution files created:
  - [ ] `.bbplugin` - Programmatic install format
  - [ ] `.bbplugin.zip` - Manual install format
- [ ] README.md includes usage instructions

**Distribution Format Requirements**:

Two artifacts are created automatically:

1. **`my-plugin.bbplugin`** (Programmatic Install)
   - Extension: `.bbplugin` (zip format with custom extension)
   - Contents at root level for DUI auto-installer compatibility
   - For automated/GUI installation

2. **`my-plugin.bbplugin.zip`** (Manual Install)
   - Extension: `.bbplugin.zip` (standard zip format)
   - Contains `my-plugin.bbplugin/` directory with all plugin files
   - Users can extract and manually place in plugins directory
   - For manual installation scenarios

Both use JSZip library (cross-platform, no system dependencies). Build script handles this automatically.

## Advanced Options

### Custom Build Configuration

Edit `scripts/build-plugin.ts` to customize:
- Target ES version
- Minification settings
- File patterns to include/exclude
- Compression method

### Manual Transpilation

If you need more control:

```typescript
import * as esbuild from 'npm:esbuild';

const result = await esbuild.transform(code, {
  loader: 'ts',
  format: 'esm',
  target: 'es2022',
});

await Deno.writeTextFile('output.js', result.code);
```

## See Also

- [Plugin Build System Documentation](./plugin-build.md) - Complete documentation
- [Plugin Development Guide](../plugins/README.md) - Creating plugins
- [Deno Compile Limitations](https://docs.deno.com/runtime/reference/cli/compiler/) - Why transpilation is needed
