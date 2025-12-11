import { describe, expect, it } from "vitest";
import {
	applyPreset,
	getPreset,
	isValidPreset,
	PRESETS,
	type PresetName,
	validateAndGetConfig,
} from "./presets.js";
import { DEFAULTS } from "./utils/args.js";

describe("PRESETS", () => {
	it("contains all expected presets", () => {
		expect(PRESETS).toHaveProperty("default");
		expect(PRESETS).toHaveProperty("vite");
		expect(PRESETS).toHaveProperty("next");
		expect(PRESETS).toHaveProperty("nuxt");
	});

	it("default preset has PUBLIC_ prefix", () => {
		expect(PRESETS.default.envPrefix).toBe("PUBLIC_");
	});

	it("vite preset has VITE_ prefix", () => {
		expect(PRESETS.vite.envPrefix).toBe("VITE_");
	});

	it("next preset has NEXT_PUBLIC_ prefix", () => {
		expect(PRESETS.next.envPrefix).toBe("NEXT_PUBLIC_");
	});

	it("nuxt preset has NUXT_PUBLIC_ prefix", () => {
		expect(PRESETS.nuxt.envPrefix).toBe("NUXT_PUBLIC_");
	});
});

describe("isValidPreset", () => {
	it("returns true for valid preset names", () => {
		expect(isValidPreset("default")).toBe(true);
		expect(isValidPreset("vite")).toBe(true);
		expect(isValidPreset("next")).toBe(true);
		expect(isValidPreset("nuxt")).toBe(true);
	});

	it("returns false for invalid preset names", () => {
		expect(isValidPreset("invalid")).toBe(false);
		expect(isValidPreset("astro")).toBe(false);
		expect(isValidPreset("sveltekit")).toBe(false);
		expect(isValidPreset("remix")).toBe(false);
	});

	it("returns false for empty string", () => {
		expect(isValidPreset("")).toBe(false);
	});

	it("returns false for special characters", () => {
		expect(isValidPreset("vite!")).toBe(false);
		expect(isValidPreset("next@latest")).toBe(false);
		expect(isValidPreset("../vite")).toBe(false);
	});

	it("is case-insensitive", () => {
		expect(isValidPreset("Vite")).toBe(true);
		expect(isValidPreset("VITE")).toBe(true);
		expect(isValidPreset("Next")).toBe(true);
		expect(isValidPreset("NEXT")).toBe(true);
		expect(isValidPreset("nUxT")).toBe(true);
		expect(isValidPreset("DeFaUlT")).toBe(true);
	});

	it("returns false for whitespace", () => {
		expect(isValidPreset(" ")).toBe(false);
		expect(isValidPreset("  vite  ")).toBe(false);
		expect(isValidPreset("\n")).toBe(false);
		expect(isValidPreset("\t")).toBe(false);
	});
});

describe("getPreset", () => {
	it("returns correct configuration for default preset", () => {
		const config = getPreset("default");
		expect(config).toEqual({ envPrefix: "PUBLIC_" });
	});

	it("returns correct configuration for vite preset", () => {
		const config = getPreset("vite");
		expect(config).toEqual({ envPrefix: "VITE_" });
	});

	it("returns correct configuration for next preset", () => {
		const config = getPreset("next");
		expect(config).toEqual({ envPrefix: "NEXT_PUBLIC_" });
	});

	it("returns correct configuration for nuxt preset", () => {
		const config = getPreset("nuxt");
		expect(config).toEqual({ envPrefix: "NUXT_PUBLIC_" });
	});

	it("returns partial Defaults object", () => {
		const config = getPreset("vite");
		expect(config).toHaveProperty("envPrefix");
		expect(config).not.toHaveProperty("dotEnvPath");
		expect(config).not.toHaveProperty("dotEnvKey");
	});
});

describe("applyPreset", () => {
	it("applies preset configuration", () => {
		const result = applyPreset("vite");
		expect(result).toEqual({ envPrefix: "VITE_" });
	});

	it("applies preset with no overrides", () => {
		const result = applyPreset("next", {});
		expect(result).toEqual({ envPrefix: "NEXT_PUBLIC_" });
	});

	it("applies preset with overrides", () => {
		const result = applyPreset("vite", { envPrefix: "CUSTOM_" });
		expect(result).toEqual({ envPrefix: "CUSTOM_" });
	});

	it("overrides take precedence over preset values", () => {
		const result = applyPreset("next", { envPrefix: "OVERRIDE_" });
		expect(result.envPrefix).toBe("OVERRIDE_");
		expect(result.envPrefix).not.toBe("NEXT_PUBLIC_");
	});

	it("preserves non-preset properties from overrides", () => {
		const result = applyPreset("vite", {
			envPrefix: "CUSTOM_",
			dotEnvPath: "./custom.env",
		});
		expect(result.envPrefix).toBe("CUSTOM_");
		expect(result.dotEnvPath).toBe("./custom.env");
	});

	it("works with multiple override properties", () => {
		const result = applyPreset("next", {
			dotEnvPath: ".env.production",
			dotEnvKey: "PROD_DB_URL",
			envPrefix: "PROD_",
		});
		expect(result).toEqual({
			envPrefix: "PROD_",
			dotEnvPath: ".env.production",
			dotEnvKey: "PROD_DB_URL",
		});
	});
});

describe("validateAndGetConfig", () => {
	it("returns baseDefaults when preset is undefined", () => {
		const result = validateAndGetConfig(undefined, DEFAULTS);
		expect(result).toEqual(DEFAULTS);
	});

	it("returns baseDefaults when preset is not provided", () => {
		const result = validateAndGetConfig(undefined, DEFAULTS);
		expect(result).toBe(DEFAULTS);
	});

	it("merges vite preset with base defaults", () => {
		const result = validateAndGetConfig("vite", DEFAULTS);
		expect(result).toEqual({
			...DEFAULTS,
			envPrefix: "VITE_",
		});
	});

	it("merges next preset with base defaults", () => {
		const result = validateAndGetConfig("next", DEFAULTS);
		expect(result).toEqual({
			...DEFAULTS,
			envPrefix: "NEXT_PUBLIC_",
		});
	});

	it("merges nuxt preset with base defaults", () => {
		const result = validateAndGetConfig("nuxt", DEFAULTS);
		expect(result).toEqual({
			...DEFAULTS,
			envPrefix: "NUXT_PUBLIC_",
		});
	});

	it("merges default preset with base defaults", () => {
		const result = validateAndGetConfig("default", DEFAULTS);
		expect(result).toEqual({
			...DEFAULTS,
			envPrefix: "PUBLIC_",
		});
	});

	it("preserves all base default properties", () => {
		const result = validateAndGetConfig("vite", DEFAULTS);
		expect(result.dotEnvPath).toBe(DEFAULTS.dotEnvPath);
		expect(result.dotEnvKey).toBe(DEFAULTS.dotEnvKey);
		expect(result.seed).toBe(DEFAULTS.seed);
		expect(result.referrer).toBe(DEFAULTS.referrer);
	});

	it("throws error for invalid preset", () => {
		expect(() => validateAndGetConfig("invalid", DEFAULTS)).toThrow(
			'Invalid preset: "invalid"',
		);
	});

	it("error message includes available presets", () => {
		expect(() => validateAndGetConfig("astro", DEFAULTS)).toThrow(
			"Available presets: default, vite, next, nuxt",
		);
	});

	it("throws error for empty string preset", () => {
		expect(() => validateAndGetConfig("", DEFAULTS)).toThrow(
			'Invalid preset: ""',
		);
	});

	it("handles case-insensitive preset names", () => {
		expect(() => validateAndGetConfig("Vite", DEFAULTS)).not.toThrow();
		expect(() => validateAndGetConfig("VITE", DEFAULTS)).not.toThrow();
		expect(() => validateAndGetConfig("Next", DEFAULTS)).not.toThrow();
		expect(() => validateAndGetConfig("NEXT", DEFAULTS)).not.toThrow();
	});

	it("returns correct config for case-insensitive preset", () => {
		const viteUpper = validateAndGetConfig("VITE", DEFAULTS);
		const viteMixed = validateAndGetConfig("ViTe", DEFAULTS);
		const viteLower = validateAndGetConfig("vite", DEFAULTS);

		expect(viteUpper.envPrefix).toBe("VITE_");
		expect(viteMixed.envPrefix).toBe("VITE_");
		expect(viteLower.envPrefix).toBe("VITE_");
	});

	it("throws error for preset with special characters", () => {
		expect(() => validateAndGetConfig("vite!", DEFAULTS)).toThrow(
			'Invalid preset: "vite!"',
		);
	});

	it("throws error for preset with whitespace", () => {
		expect(() => validateAndGetConfig(" vite ", DEFAULTS)).toThrow(
			'Invalid preset: " vite "',
		);
	});

	it("works with custom base defaults", () => {
		const customDefaults = {
			...DEFAULTS,
			dotEnvPath: ".env.custom",
			dotEnvKey: "CUSTOM_URL",
		};
		const result = validateAndGetConfig("vite", customDefaults);
		expect(result).toEqual({
			...customDefaults,
			envPrefix: "VITE_",
		});
	});

	it("does not mutate baseDefaults", () => {
		const baseDefaults = { ...DEFAULTS };
		const originalEnvPrefix = baseDefaults.envPrefix;
		validateAndGetConfig("vite", baseDefaults);
		expect(baseDefaults.envPrefix).toBe(originalEnvPrefix);
	});
});

describe("Edge cases", () => {
	it("handles all presets without errors", () => {
		const presetNames: PresetName[] = ["default", "vite", "next", "nuxt"];
		for (const name of presetNames) {
			expect(() => validateAndGetConfig(name, DEFAULTS)).not.toThrow();
		}
	});

	it("preset values override only specified properties", () => {
		const result = validateAndGetConfig("vite", DEFAULTS);
		// Only envPrefix should be different from DEFAULTS
		expect(result.envPrefix).not.toBe(DEFAULTS.envPrefix);
		expect(result.dotEnvPath).toBe(DEFAULTS.dotEnvPath);
		expect(result.dotEnvKey).toBe(DEFAULTS.dotEnvKey);
		expect(result.seed).toBe(DEFAULTS.seed);
		expect(result.referrer).toBe(DEFAULTS.referrer);
	});

	it("getPreset returns reference to preset object", () => {
		const preset1 = getPreset("vite");
		const preset2 = getPreset("vite");
		expect(preset1).toBe(preset2);
	});

	it("validateAndGetConfig creates new object", () => {
		const result = validateAndGetConfig("vite", DEFAULTS);
		expect(result).not.toBe(DEFAULTS);
		expect(result).not.toBe(PRESETS.vite);
	});

	describe("Case-insensitive matching", () => {
		it("all lowercase works", () => {
			expect(() => validateAndGetConfig("vite", DEFAULTS)).not.toThrow();
			expect(() => validateAndGetConfig("next", DEFAULTS)).not.toThrow();
			expect(() => validateAndGetConfig("nuxt", DEFAULTS)).not.toThrow();
			expect(() =>
				validateAndGetConfig("default", DEFAULTS),
			).not.toThrow();
		});

		it("all uppercase works", () => {
			expect(() => validateAndGetConfig("VITE", DEFAULTS)).not.toThrow();
			expect(() => validateAndGetConfig("NEXT", DEFAULTS)).not.toThrow();
			expect(() => validateAndGetConfig("NUXT", DEFAULTS)).not.toThrow();
			expect(() =>
				validateAndGetConfig("DEFAULT", DEFAULTS),
			).not.toThrow();
		});

		it("mixed case works", () => {
			expect(() => validateAndGetConfig("Vite", DEFAULTS)).not.toThrow();
			expect(() => validateAndGetConfig("ViTe", DEFAULTS)).not.toThrow();
			expect(() => validateAndGetConfig("Next", DEFAULTS)).not.toThrow();
			expect(() => validateAndGetConfig("NeXt", DEFAULTS)).not.toThrow();
		});

		it("returns same config regardless of case", () => {
			const lower = validateAndGetConfig("vite", DEFAULTS);
			const upper = validateAndGetConfig("VITE", DEFAULTS);
			const mixed = validateAndGetConfig("ViTe", DEFAULTS);

			expect(lower).toEqual(upper);
			expect(upper).toEqual(mixed);
			expect(lower.envPrefix).toBe("VITE_");
		});

		it("all case variations produce identical results", () => {
			const variations = ["vite", "VITE", "Vite", "VIte", "viTE"];
			const results = variations.map((v) =>
				validateAndGetConfig(v, DEFAULTS),
			);

			// All results should have the same envPrefix
			for (const result of results) {
				expect(result.envPrefix).toBe("VITE_");
			}

			// All results should be equal
			for (let i = 1; i < results.length; i++) {
				expect(results[i]).toEqual(results[0]);
			}
		});

		it("invalid preset still fails regardless of case", () => {
			expect(() => validateAndGetConfig("invalid", DEFAULTS)).toThrow();
			expect(() => validateAndGetConfig("INVALID", DEFAULTS)).toThrow();
			expect(() => validateAndGetConfig("Invalid", DEFAULTS)).toThrow();
			expect(() => validateAndGetConfig("astro", DEFAULTS)).toThrow();
			expect(() => validateAndGetConfig("ASTRO", DEFAULTS)).toThrow();
		});

		it("isValidPreset works with all cases", () => {
			expect(isValidPreset("vite")).toBe(true);
			expect(isValidPreset("VITE")).toBe(true);
			expect(isValidPreset("Vite")).toBe(true);
			expect(isValidPreset("invalid")).toBe(false);
			expect(isValidPreset("INVALID")).toBe(false);
		});
	});
});
