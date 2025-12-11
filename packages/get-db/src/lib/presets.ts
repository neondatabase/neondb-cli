import type { Defaults } from "./types.js";

/**
 * Framework presets that adjust default values for popular frameworks
 */
export const PRESETS = {
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

export type PresetName = keyof typeof PRESETS;

/**
 * Check if a string is a valid preset name (case-insensitive)
 */
export function isValidPreset(preset: string): preset is PresetName {
	return preset.toLowerCase() in PRESETS;
}

/**
 * Get the configuration for a preset
 */
export function getPreset(preset: PresetName): Partial<Defaults> {
	return PRESETS[preset];
}

/**
 * Apply a preset to the defaults, allowing overrides
 */
export function applyPreset(
	preset: PresetName,
	overrides: Partial<Defaults> = {},
): Partial<Defaults> {
	return {
		...PRESETS[preset],
		...overrides,
	};
}

/**
 * Validate a preset and return the configuration, or throw an error if invalid
 * Preset matching is case-insensitive
 */
export function validateAndGetConfig(
	preset: string | undefined,
	baseDefaults: Defaults,
): Defaults {
	if (preset === undefined) {
		return baseDefaults;
	}

	const normalizedPreset = preset.toLowerCase();

	if (!isValidPreset(preset)) {
		throw new Error(
			`Invalid preset: "${preset}". Available presets: ${Object.keys(PRESETS).join(", ")}`,
		);
	}

	return {
		...baseDefaults,
		...PRESETS[normalizedPreset as PresetName],
	};
}
