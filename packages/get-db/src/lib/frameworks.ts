import type { Defaults } from "./types.js";

/**
 * Framework configurations that adjust default values for popular frameworks
 */
export const FRAMEWORKS = {
	default: {
		envPrefix: "PUBLIC_",
	},
	vite: {
		envPrefix: "VITE_",
	},
	next: {
		envPrefix: "NEXT_PUBLIC_",
	},
	nuxt: {
		envPrefix: "NUXT_PUBLIC_",
	},
} as const satisfies Record<string, Partial<Defaults>>;

export type FrameworkName = keyof typeof FRAMEWORKS;

/**
 * Check if a string is a valid framework name (case-insensitive)
 */
export function isValidFramework(
	framework: string,
): framework is FrameworkName {
	return framework.toLowerCase() in FRAMEWORKS;
}

/**
 * Get the configuration for a framework
 */
export function getFramework(framework: FrameworkName): Partial<Defaults> {
	return FRAMEWORKS[framework];
}

/**
 * Apply a framework to the defaults, allowing overrides
 */
export function applyFramework(
	framework: FrameworkName,
	overrides: Partial<Defaults> = {},
): Partial<Defaults> {
	return {
		...FRAMEWORKS[framework],
		...overrides,
	};
}

/**
 * Validate a framework and return the configuration, or throw an error if invalid
 * Framework matching is case-insensitive
 */
export function validateAndGetConfig(
	framework: string | undefined,
	baseDefaults: Defaults,
): Defaults {
	if (framework === undefined) {
		return baseDefaults;
	}

	const normalizedFramework = framework.toLowerCase();

	if (!isValidFramework(framework)) {
		throw new Error(
			`Invalid framework: "${framework}". Available frameworks: ${Object.keys(FRAMEWORKS).join(", ")}`,
		);
	}

	return {
		...baseDefaults,
		...FRAMEWORKS[normalizedFramework as FrameworkName],
	};
}
