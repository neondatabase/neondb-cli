#!/usr/bin/env node

console.warn("");
console.warn(
	"\x1b[33m%s\x1b[0m",
	'⚠️  DEPRECATION WARNING: The "neondb" package has been renamed to "get-db".',
);
console.warn("\x1b[33m%s\x1b[0m", '   Please use "get-db" instead.');

import { dirname, resolve } from "node:path";
// Import and run the CLI from get-db
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the path to get-db's CLI
const getDbCliPath = resolve(__dirname, "../../get-db/dist/cli.js");

// Import and execute the get-db CLI
import(getDbCliPath);
