/**
 * @deprecated This package has been renamed to "get-db".
 * Please update your imports: import { instantNeon } from 'get-db/sdk'
 */

console.warn(
	"\x1b[33m%s\x1b[0m",
	'⚠️  DEPRECATION WARNING: The "neondb" package has been renamed to "get-db".',
);
console.warn(
	"\x1b[33m%s\x1b[0m",
	'   Please update your imports to use "get-db/sdk" or "get-db/launchpad" instead.',
);
console.warn("");

// Re-export everything from get-db
export * from "get-db/sdk";
