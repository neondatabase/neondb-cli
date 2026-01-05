#!/usr/bin/env node

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { log } from "@clack/prompts";
import { init } from "./index.js";

/**
 * Parse command line arguments
 */
function parseArgs(): { vsixPath?: string } {
	const args = process.argv.slice(2);
	const options: { vsixPath?: string } = {};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === "--vsix" || arg === "-v") {
			const vsixPath = args[i + 1];
			if (!vsixPath || vsixPath.startsWith("-")) {
				log.error("--vsix requires a path to a .vsix file");
				process.exit(1);
			}

			const resolvedPath = resolve(vsixPath);
			if (!existsSync(resolvedPath)) {
				log.error(`VSIX file not found: ${resolvedPath}`);
				process.exit(1);
			}

			if (!resolvedPath.endsWith(".vsix")) {
				log.error("File must have a .vsix extension");
				process.exit(1);
			}

			options.vsixPath = resolvedPath;
			i++; // Skip the next argument since we consumed it
		} else if (arg === "--help" || arg === "-h") {
			console.log(`
Usage: neon-init [options]

Options:
  -v, --vsix <path>  Install extension from a local .vsix file (for testing)
  -h, --help         Show this help message

Examples:
  neon-init                              Install from marketplace
  neon-init --vsix ./my-extension.vsix   Install from local file
`);
			process.exit(0);
		}
	}

	return options;
}

const options = parseArgs();
await init(options);
