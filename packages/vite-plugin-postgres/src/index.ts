console.warn(
	"\x1b[33m%s\x1b[0m",
	'⚠️  DEPRECATION WARNING: The "@neondatabase/vite-plugin-postgres" package has been renamed to "vite-plugin-db".',
);
console.warn(
	"\x1b[33m%s\x1b[0m",
	'   Please update your imports to use "vite-plugin-db" instead.',
);
console.warn("");

/**
 * @deprecated This package has been renamed to "vite-plugin-db".
 * @see https://www.npmjs.com/package/vite-plugin-db
 */
export * from "vite-plugin-db";
