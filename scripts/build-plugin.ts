#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net --allow-run --unstable-bundle
/**
 * Build script for BB plugins
 * Transpiles TypeScript files to JavaScript while preserving directory structure
 * Copies non-TypeScript files as-is
 * Creates a distributable zip file
 *
 * Usage:
 *   ./build-plugin.ts <plugin-dir> [output-dir] [options]
 *
 * Options:
 *   --verbose, -v          Show detailed build output
 *   --no-zip               Skip zip file creation
 *   --dev-build            Include .ts source files alongside .js (for dev environments)
 *   --deno-api-bundle      Use Deno.bundle() API (Deno 2.5+)');
 *   --deno-cli-bundle      Use deno bundle CLI (Deno 2.4+)');
 *   --deno-bundle          Alias for --deno-api-bundle');
 *   --esbuild-bundle       Use esbuild bundle');
 *
 * Examples:
 *   ./build-plugin.ts my-tools.bbplugin
 *   ./build-plugin.ts my-tools.bbplugin dist/plugins
 *   ./build-plugin.ts my-tools.bbplugin --dev-build
 */

import { walk } from '@std/fs';
import { dirname, join, relative } from '@std/path';
import { ensureDir } from '@std/fs';
import { parseArgs } from 'jsr:@std/cli/parse-args';
import * as esbuild from 'npm:esbuild@0.27.0';
import { denoPlugins } from 'jsr:@luca/esbuild-deno-loader@^0.11.1';
import JSZip from 'npm:jszip@3.10.1';

const SHOULD_TRANSPILE = ['.ts', '.tsx'];
const SHOULD_COPY = ['.json', '.md', '.tsx']; // .tsx files copied for browser use
const SHOULD_SKIP = ['.test.ts', '.test.tsx'];

interface BuildOptions {
	pluginDir: string;
	outputDir: string;
	createZip: boolean;
	verbose: boolean;
	devBuild: boolean; // Include .ts files alongside .js for dev environments
	esbuildBundle: boolean; // Use esbuild
	denoCliBundle: boolean; // Use Deno bundle CLI (Deno 2.4+)
	denoApiBundle: boolean; // Use Deno.bundle() API (Deno 2.5+, requires --unstable-bundle)
}

/**
 * Transpile TypeScript to JavaScript using Deno.bundle() API
 * Uses Deno 2.5+ bundler API with in-memory processing
 * Requires --unstable-bundle flag
 */
async function transpileFileDenoApiBundle(inputPath: string, outputPath: string, verbose: boolean): Promise<void> {
	await ensureDir(dirname(outputPath));

	try {
		// Use Deno.bundle() API (Deno 2.5+)
		const result = await (Deno as any).bundle({
			entrypoints: [inputPath],
			platform: 'deno',
			format: 'esm',
			minify: false,
			write: false, // Process in memory
		});

		if (!result.outputFiles || result.outputFiles.length === 0) {
			throw new Error(`No output generated for ${inputPath}`);
		}

		// Write the bundled output
		const bundledCode = result.outputFiles[0].text();
		await Deno.writeTextFile(outputPath, bundledCode);

		if (verbose) {
			console.log(`  Bundle size: ${(bundledCode.length / 1024).toFixed(2)} KB`);
		}
	} catch (error) {
		throw new Error(`Failed to bundle ${inputPath} using Deno.bundle(): ${error.message}`);
	}
}

/**
 * Transpile TypeScript to JavaScript using native Deno bundle command
 * Uses Deno 2.4+ bundler with automatic tree shaking and minification
 */
async function transpileFileDenoCliBundle(inputPath: string, outputPath: string, verbose: boolean): Promise<void> {
	await ensureDir(dirname(outputPath));

	// Use Deno bundle command (Deno 2.4+)
	const bundleCommand = new Deno.Command('deno', {
		args: [
			'bundle',
			inputPath,
			'--output',
			outputPath,
			'--platform',
			'deno',
			'--format',
			'esm',
		],
		stdout: 'piped',
		stderr: 'piped',
	});

	const { code, stdout, stderr } = await bundleCommand.output();

	if (code !== 0) {
		const errorText = new TextDecoder().decode(stderr);
		throw new Error(`Failed to bundle ${inputPath}: ${errorText}`);
	}

	if (verbose && stderr.length > 0) {
		const warningText = new TextDecoder().decode(stderr);
		console.warn(`Warnings for ${inputPath}:`, warningText);
	}
}

/**
 * Transpile TypeScript to JavaScript using esbuild build API
 * Bundles external dependencies (like JSR imports) so they work in compiled mode
 */
async function transpileFileEsbuild(inputPath: string, outputPath: string, configPath?: string): Promise<void> {
	await ensureDir(dirname(outputPath));

	// Configure deno-loader with import map
	// Use ONLY importMapURL, not configPath (they conflict)
	let denoConfig = undefined;
	if (configPath) {
		const configDir = dirname(configPath);
		const importMapPath = join(configDir, 'import_map.json');

		// Check if import_map.json exists
		try {
			await Deno.stat(importMapPath);
			// Only provide importMapURL - providing both causes conflicts
			denoConfig = {
				importMapURL: `file://${importMapPath}`,
			};
		} catch {
			// No import_map.json, use configPath (deno.json might have inline imports)
			denoConfig = { configPath };
		}
	}

	const result = await esbuild.build({
		plugins: [...denoPlugins(denoConfig)], // Handle Deno-style imports (JSR, NPM, etc.)
		entryPoints: [inputPath],
		outfile: outputPath,
		bundle: true, // Bundle external dependencies
		format: 'esm',
		target: 'es2022',
		platform: 'neutral',
		absWorkingDir: configPath ? dirname(configPath) : undefined, // Resolve imports from config directory
		minify: false,
		keepNames: true,
		sourcemap: false,
		treeShaking: false,
		jsx: 'automatic', // Enable automatic JSX runtime
		jsxImportSource: 'preact', // Use Preact as JSX source
		// External modules that aren't needed at runtime
		external: [
			// Node.js built-ins (not available in Deno)
			'node:process',
			'node:buffer',
			'node:path',
			'node:url',
			'node:child_process',
			'node:fs',
			'node:os',
		],
		write: true,
	});

	if (result.warnings.length > 0) {
		console.warn(`Warnings for ${inputPath}:`, result.warnings.map((w) => w.text).join(', '));
	}

	if (result.errors.length > 0) {
		throw new Error(`Failed to transpile ${inputPath}: ${result.errors.map((e) => e.text).join(', ')}`);
	}
}

/**
 * Copy file as-is
 */
async function copyFile(inputPath: string, outputPath: string): Promise<void> {
	await ensureDir(dirname(outputPath));
	await Deno.copyFile(inputPath, outputPath);
}

/**
 * Check if file should be skipped
 */
function shouldSkip(path: string): boolean {
	return SHOULD_SKIP.some((pattern) => path.endsWith(pattern));
}

/**
 * Check if file should be transpiled
 */
function shouldTranspile(path: string): boolean {
	return SHOULD_TRANSPILE.some((ext) => path.endsWith(ext)) && !shouldSkip(path);
}

/**
 * Check if file should be copied
 */
function shouldCopy(path: string): boolean {
	return SHOULD_COPY.some((ext) => path.endsWith(ext));
}

/**
 * Find deno.json or deno.jsonc in project root or parent directories
 */
async function findProjectConfig(): Promise<string | undefined> {
	const configNames = ['deno.json', 'deno.jsonc'];
	let currentDir = Deno.cwd();

	// Search up to 5 levels
	for (let i = 0; i < 5; i++) {
		for (const name of configNames) {
			const configPath = join(currentDir, name);
			try {
				await Deno.stat(configPath);
				return configPath;
			} catch {
				// File doesn't exist, continue
			}
		}

		const parentDir = dirname(currentDir);
		if (parentDir === currentDir) break; // Reached root
		currentDir = parentDir;
	}

	return undefined;
}

/**
 * Build plugin by transpiling TypeScript and copying other files
 */
async function buildPlugin(options: BuildOptions): Promise<string> {
	const { pluginDir, outputDir, verbose } = options;

	console.log(`Building plugin from: ${pluginDir}`);
	console.log(`Output directory: ${outputDir}`);

	// Find project deno.json/deno.jsonc for import maps
	const projectConfig = await findProjectConfig();
	if (projectConfig && verbose) {
		console.log(`Using config: ${projectConfig}`);
	}

	// Read manifest to get plugin name
	const manifestPath = join(pluginDir, 'manifest.json');
	const manifest = JSON.parse(await Deno.readTextFile(manifestPath));
	const pluginName = manifest.name;

	// Use .build suffix to avoid name collision with distributable file
	const buildDir = join(outputDir, `${pluginName}.bbplugin.build`);
	await ensureDir(buildDir);

	let filesProcessed = 0;
	let filesSkipped = 0;

	// Walk through all files in plugin directory
	for await (const entry of walk(pluginDir, { includeFiles: true, includeDirs: false })) {
		if (entry.isFile) {
			const relativePath = relative(pluginDir, entry.path);

			if (shouldSkip(entry.path)) {
				if (verbose) console.log(`  [SKIP] ${relativePath}`);
				filesSkipped++;
				continue;
			}

			if (shouldTranspile(entry.path)) {
				// Transpile .ts/.tsx to .js
				const outputPath = join(buildDir, relativePath.replace(/\.tsx?$/, '.js'));
				if (verbose) console.log(`  [TRANSPILE] ${relativePath} -> ${relative(outputDir, outputPath)}`);

				// Use native Deno bundle API, CLI, or esbuild
				if (options.denoApiBundle) {
					await transpileFileDenoApiBundle(entry.path, outputPath, verbose);
				} else if (options.denoCliBundle) {
					await transpileFileDenoCliBundle(entry.path, outputPath, verbose);
				} else if (options.esbuildBundle) {
					await transpileFileEsbuild(entry.path, outputPath, projectConfig);
				} else {
					await transpileFileDenoApiBundle(entry.path, outputPath, verbose);
				}
				filesProcessed++;

				// In dev-build mode, also copy the original .ts file
				if (options.devBuild && entry.path.endsWith('.ts')) {
					const tsOutputPath = join(buildDir, relativePath);
					if (verbose) console.log(`  [COPY-DEV] ${relativePath}`);
					await copyFile(entry.path, tsOutputPath);
					filesProcessed++;
				}
			} else if (shouldCopy(entry.path)) {
				// Copy .json, .md, and .tsx files as-is
				const outputPath = join(buildDir, relativePath);
				if (verbose) console.log(`  [COPY] ${relativePath}`);
				await copyFile(entry.path, outputPath);
				filesProcessed++;
			} else {
				if (verbose) console.log(`  [IGNORE] ${relativePath}`);
				filesSkipped++;
			}
		}
	}

	console.log(`\nBuild complete:`);
	console.log(`  Files processed: ${filesProcessed}`);
	console.log(`  Files skipped: ${filesSkipped}`);
	if (options.devBuild) {
		console.log(`  Build mode: Development (includes .ts and .js files)`);
	} else {
		console.log(`  Build mode: Production (includes .js files only)`);
	}
	const bundler = options.denoApiBundle
		? 'Deno.bundle() API (Deno 2.5+)'
		: options.denoCliBundle
		? 'deno bundle CLI (Deno 2.4+)'
		: options.esbuildBundle
		? 'esbuild'
		: 'Deno.bundle() API (Deno 2.5+)';
	console.log(`  Bundler: ${bundler}`);
	console.log(`  Output: ${buildDir}`);

	return buildDir;
}

/**
 * Create distributable zip file containing just the plugin contents
 * (not the .bbplugin directory itself)
 * Uses JSZip for cross-platform compatibility
 */
async function createDistributable(
	buildDir: string,
	outputDir: string,
	pluginName: string,
	pluginVersion: string,
): Promise<string> {
	// Use .bbplugin extension for DUI file associations
	const zipFileName = `${pluginName}.bbplugin`;
	const zipPath = join(outputDir, zipFileName);

	console.log(`\nCreating distributable: ${zipFileName}`);

	// Create new JSZip instance
	const zip = new JSZip();

	// Walk build directory and add all files to zip at root level
	for await (const entry of walk(buildDir, { includeFiles: true, includeDirs: false })) {
		if (entry.isFile) {
			const relativePath = relative(buildDir, entry.path);
			const fileContent = await Deno.readFile(entry.path);
			zip.file(relativePath, fileContent);
		}
	}

	// Generate zip file
	const zipContent = await zip.generateAsync({
		type: 'uint8array',
		compression: 'DEFLATE',
		compressionOptions: { level: 9 },
	});

	// Write to disk
	await ensureDir(dirname(zipPath));
	await Deno.writeFile(zipPath, zipContent);

	const stats = await Deno.stat(zipPath);
	console.log(`  Created: ${zipPath} (${(stats.size / 1024).toFixed(2)} KB)`);
	console.log(`  Version: ${pluginVersion}`);
	console.log(`  Format: .bbplugin (zip format for DUI file association)`);
	console.log(`  Contents: Plugin files at zip root (no enclosing directory)`);

	return zipPath;
}

/**
 * Create manual install zip file with plugin directory structure
 * Creates a .bbplugin.zip containing a directory named .bbplugin with all plugin contents
 * Users can extract this to get a ready-to-use plugin directory
 * Uses JSZip for cross-platform compatibility
 */
async function createManualInstallZip(
	buildDir: string,
	outputDir: string,
	pluginName: string,
	pluginVersion: string,
): Promise<string> {
	const zipFileName = `${pluginName}.bbplugin.zip`;
	const zipPath = join(outputDir, zipFileName);

	console.log(`\nCreating manual install package: ${zipFileName}`);

	// Create new JSZip instance
	const zip = new JSZip();

	// Walk build directory and add all files with plugin directory prefix
	const pluginDirName = `${pluginName}.bbplugin`;
	for await (const entry of walk(buildDir, { includeFiles: true, includeDirs: false })) {
		if (entry.isFile) {
			const relativePath = relative(buildDir, entry.path);
			// Add files under pluginDirName/ in the zip
			const zipPath = join(pluginDirName, relativePath);
			const fileContent = await Deno.readFile(entry.path);
			zip.file(zipPath, fileContent);
		}
	}

	// Generate zip file
	const zipContent = await zip.generateAsync({
		type: 'uint8array',
		compression: 'DEFLATE',
		compressionOptions: { level: 9 },
	});

	// Write to disk
	await ensureDir(dirname(zipPath));
	await Deno.writeFile(zipPath, zipContent);

	const stats = await Deno.stat(zipPath);
	console.log(`  Created: ${zipPath} (${(stats.size / 1024).toFixed(2)} KB)`);
	console.log(`  Version: ${pluginVersion}`);
	console.log(`  Format: .bbplugin.zip (standard zip for manual install)`);
	console.log(`  Contents: ${pluginDirName}/ directory with all plugin files`);

	return zipPath;
}

/**
 * Main entry point
 */
async function main() {
	// Parse arguments properly separating flags from positional args
	const args = parseArgs(Deno.args, {
		boolean: ['verbose', 'v', 'no-zip', 'dev-build', 'deno-cli-bundle', 'deno-api-bundle', 'deno-bundle', 'esbuild-bundle'],
		string: ['_'], // positional arguments
		alias: {
			v: 'verbose',
		},
		default: {
			verbose: false,
			'no-zip': false,
			'dev-build': false,
			'deno-cli-bundle': false,
			'deno-api-bundle': false,
			'deno-bundle': false,
			'esbuild-bundle': false,
		},
	});

	// Get positional arguments
	const positional = args._;

	if (positional.length < 1) {
		console.error('Usage: build-plugin.ts <plugin-dir> [output-dir] [options]');
		console.error('\nOptions:');
		console.error('  --verbose, -v          Show detailed build output');
		console.error('  --no-zip               Skip zip file creation');
		console.error('  --dev-build            Include .ts source files alongside .js');
		console.error('  --deno-api-bundle      Use Deno.bundle() API (Deno 2.5+)');
		console.error('  --deno-cli-bundle      Use deno bundle CLI (Deno 2.4+)');
		console.error('  --deno-bundle          Alias for --deno-api-bundle');
		console.error('  --esbuild-bundle       Use esbuild bundle');
		console.error('\nExamples:');
		console.error(
			'  build-plugin.ts my-tools.bbplugin',
		);
		console.error(
			'  build-plugin.ts my-tools.bbplugin dist/bb-plugins',
		);
		console.error(
			'  build-plugin.ts my-tools.bbplugin --dev-build',
		);
		console.error(
			'  build-plugin.ts my-tools.bbplugin --dev-build --deno-cli-bundle',
		);
		Deno.exit(1);
	}

	const pluginDir = String(positional[0]);
	const outputDir = positional[1] ? String(positional[1]) : 'dist/plugins';
	const verbose = args.verbose || args.v;
	const noZip = args['no-zip'];
	const devBuild = args['dev-build'];
	const denoCliBundle = args['deno-cli-bundle'];
	const denoApiBundle = args['deno-api-bundle'] || args['deno-bundle'];
	const esbuildBundle = args['esbuild-bundle'];

	try {
		// Build plugin
		const buildDir = await buildPlugin({
			pluginDir,
			outputDir,
			createZip: !noZip,
			verbose,
			devBuild,
			denoCliBundle,
			denoApiBundle,
			esbuildBundle,
		});

		// Read manifest for zip file naming
		const manifestPath = join(pluginDir, 'manifest.json');
		const manifest = JSON.parse(await Deno.readTextFile(manifestPath));

		// Create distributable zip files
		if (!noZip) {
			// Create .bbplugin (flat contents for programmatic install)
			await createDistributable(buildDir, outputDir, manifest.name, manifest.version);
			// Create .bbplugin.zip (nested directory for manual install)
			await createManualInstallZip(buildDir, outputDir, manifest.name, manifest.version);
		}

		console.log('\n✓ Build successful!');
	} catch (error) {
		console.error('\n✗ Build failed:', error.message);
		if (verbose) {
			console.error(error.stack);
		}
		Deno.exit(1);
	} finally {
		// Clean up esbuild (only if it was used)
		//if (esbuildBundle || (!denoCliBundle && !denoApiBundle)) {
		if (esbuildBundle) {
			esbuild.stop();
		}
	}
}

if (import.meta.main) {
	main();
}
