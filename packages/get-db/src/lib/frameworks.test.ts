import { describe, expect, it } from "vitest";
import {
	applyFramework,
	FRAMEWORKS,
	type FrameworkName,
	getFramework,
	isValidFramework,
	validateAndGetConfig,
} from "./frameworks.js";
import { DEFAULTS } from "./utils/args.js";

describe("FRAMEWORKS", () => {
	it("contains all expected frameworks", () => {
		expect(FRAMEWORKS).toHaveProperty("default");
		expect(FRAMEWORKS).toHaveProperty("vite");
		expect(FRAMEWORKS).toHaveProperty("next");
		expect(FRAMEWORKS).toHaveProperty("nuxt");
	});

	it("default framework has PUBLIC_ prefix", () => {
		expect(FRAMEWORKS.default.envPrefix).toBe("PUBLIC_");
	});

	it("vite framework has VITE_ prefix", () => {
		expect(FRAMEWORKS.vite.envPrefix).toBe("VITE_");
	});

	it("next framework has NEXT_PUBLIC_ prefix", () => {
		expect(FRAMEWORKS.next.envPrefix).toBe("NEXT_PUBLIC_");
	});

	it("nuxt framework has NUXT_PUBLIC_ prefix", () => {
		expect(FRAMEWORKS.nuxt.envPrefix).toBe("NUXT_PUBLIC_");
	});
});

describe("isValidFramework", () => {
	it("returns true for valid framework names", () => {
		expect(isValidFramework("default")).toBe(true);
		expect(isValidFramework("vite")).toBe(true);
		expect(isValidFramework("next")).toBe(true);
		expect(isValidFramework("nuxt")).toBe(true);
	});

	it("returns false for invalid framework names", () => {
		expect(isValidFramework("invalid")).toBe(false);
		expect(isValidFramework("astro")).toBe(false);
		expect(isValidFramework("sveltekit")).toBe(false);
		expect(isValidFramework("remix")).toBe(false);
	});

	it("returns false for empty string", () => {
		expect(isValidFramework("")).toBe(false);
	});

	it("returns false for special characters", () => {
		expect(isValidFramework("vite!")).toBe(false);
		expect(isValidFramework("next@latest")).toBe(false);
		expect(isValidFramework("../vite")).toBe(false);
	});

	it("is case-insensitive", () => {
		expect(isValidFramework("Vite")).toBe(true);
		expect(isValidFramework("VITE")).toBe(true);
		expect(isValidFramework("Next")).toBe(true);
		expect(isValidFramework("NEXT")).toBe(true);
		expect(isValidFramework("nUxT")).toBe(true);
		expect(isValidFramework("DeFaUlT")).toBe(true);
	});

	it("returns false for whitespace", () => {
		expect(isValidFramework(" ")).toBe(false);
		expect(isValidFramework("  vite  ")).toBe(false);
		expect(isValidFramework("\n")).toBe(false);
		expect(isValidFramework("\t")).toBe(false);
	});
});

describe("getFramework", () => {
	it("returns correct configuration for default framework", () => {
		const config = getFramework("default");
		expect(config).toEqual({ envPrefix: "PUBLIC_" });
	});

	it("returns correct configuration for vite framework", () => {
		const config = getFramework("vite");
		expect(config).toEqual({ envPrefix: "VITE_" });
	});

	it("returns correct configuration for next framework", () => {
		const config = getFramework("next");
		expect(config).toEqual({ envPrefix: "NEXT_PUBLIC_" });
	});

	it("returns correct configuration for nuxt framework", () => {
		const config = getFramework("nuxt");
		expect(config).toEqual({ envPrefix: "NUXT_PUBLIC_" });
	});

	it("returns partial Defaults object", () => {
		const config = getFramework("vite");
		expect(config).toHaveProperty("envPrefix");
		expect(config).not.toHaveProperty("dotEnvPath");
		expect(config).not.toHaveProperty("dotEnvKey");
	});
});

describe("applyFramework", () => {
	it("applies framework configuration", () => {
		const result = applyFramework("vite");
		expect(result).toEqual({ envPrefix: "VITE_" });
	});

	it("applies framework with no overrides", () => {
		const result = applyFramework("next", {});
		expect(result).toEqual({ envPrefix: "NEXT_PUBLIC_" });
	});

	it("applies framework with overrides", () => {
		const result = applyFramework("vite", { envPrefix: "CUSTOM_" });
		expect(result).toEqual({ envPrefix: "CUSTOM_" });
	});

	it("overrides take precedence over framework values", () => {
		const result = applyFramework("next", { envPrefix: "OVERRIDE_" });
		expect(result.envPrefix).toBe("OVERRIDE_");
		expect(result.envPrefix).not.toBe("NEXT_PUBLIC_");
	});

	it("preserves non-framework properties from overrides", () => {
		const result = applyFramework("vite", {
			envPrefix: "CUSTOM_",
			dotEnvPath: "./custom.env",
		});
		expect(result.envPrefix).toBe("CUSTOM_");
		expect(result.dotEnvPath).toBe("./custom.env");
	});

	it("works with multiple override properties", () => {
		const result = applyFramework("next", {
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
	it("returns baseDefaults when framework is undefined", () => {
		const result = validateAndGetConfig(undefined, DEFAULTS);
		expect(result).toEqual(DEFAULTS);
	});

	it("returns baseDefaults when framework is not provided", () => {
		const result = validateAndGetConfig(undefined, DEFAULTS);
		expect(result).toBe(DEFAULTS);
	});

	it("merges vite framework with base defaults", () => {
		const result = validateAndGetConfig("vite", DEFAULTS);
		expect(result).toEqual({
			...DEFAULTS,
			envPrefix: "VITE_",
		});
	});

	it("merges next framework with base defaults", () => {
		const result = validateAndGetConfig("next", DEFAULTS);
		expect(result).toEqual({
			...DEFAULTS,
			envPrefix: "NEXT_PUBLIC_",
		});
	});

	it("merges nuxt framework with base defaults", () => {
		const result = validateAndGetConfig("nuxt", DEFAULTS);
		expect(result).toEqual({
			...DEFAULTS,
			envPrefix: "NUXT_PUBLIC_",
		});
	});

	it("merges default framework with base defaults", () => {
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

	it("throws error for invalid framework", () => {
		expect(() => validateAndGetConfig("invalid", DEFAULTS)).toThrow(
			'Invalid framework: "invalid"',
		);
	});

	it("error message includes available frameworks", () => {
		expect(() => validateAndGetConfig("astro", DEFAULTS)).toThrow(
			"Available frameworks: default, vite, next, nuxt",
		);
	});

	it("throws error for empty string framework", () => {
		expect(() => validateAndGetConfig("", DEFAULTS)).toThrow(
			'Invalid framework: ""',
		);
	});

	it("handles case-insensitive framework names", () => {
		expect(() => validateAndGetConfig("Vite", DEFAULTS)).not.toThrow();
		expect(() => validateAndGetConfig("VITE", DEFAULTS)).not.toThrow();
		expect(() => validateAndGetConfig("Next", DEFAULTS)).not.toThrow();
		expect(() => validateAndGetConfig("NEXT", DEFAULTS)).not.toThrow();
	});

	it("returns correct config for case-insensitive framework", () => {
		const viteUpper = validateAndGetConfig("VITE", DEFAULTS);
		const viteMixed = validateAndGetConfig("ViTe", DEFAULTS);
		const viteLower = validateAndGetConfig("vite", DEFAULTS);

		expect(viteUpper.envPrefix).toBe("VITE_");
		expect(viteMixed.envPrefix).toBe("VITE_");
		expect(viteLower.envPrefix).toBe("VITE_");
	});

	it("throws error for framework with special characters", () => {
		expect(() => validateAndGetConfig("vite!", DEFAULTS)).toThrow(
			'Invalid framework: "vite!"',
		);
	});

	it("throws error for framework with whitespace", () => {
		expect(() => validateAndGetConfig(" vite ", DEFAULTS)).toThrow(
			'Invalid framework: " vite "',
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
	it("handles all frameworks without errors", () => {
		const frameworkNames: FrameworkName[] = [
			"default",
			"vite",
			"next",
			"nuxt",
		];
		for (const name of frameworkNames) {
			expect(() => validateAndGetConfig(name, DEFAULTS)).not.toThrow();
		}
	});

	it("framework values override only specified properties", () => {
		const result = validateAndGetConfig("vite", DEFAULTS);
		// Only envPrefix should be different from DEFAULTS
		expect(result.envPrefix).not.toBe(DEFAULTS.envPrefix);
		expect(result.dotEnvPath).toBe(DEFAULTS.dotEnvPath);
		expect(result.dotEnvKey).toBe(DEFAULTS.dotEnvKey);
		expect(result.seed).toBe(DEFAULTS.seed);
		expect(result.referrer).toBe(DEFAULTS.referrer);
	});

	it("getFramework returns reference to framework object", () => {
		const framework1 = getFramework("vite");
		const framework2 = getFramework("vite");
		expect(framework1).toBe(framework2);
	});

	it("validateAndGetConfig creates new object", () => {
		const result = validateAndGetConfig("vite", DEFAULTS);
		expect(result).not.toBe(DEFAULTS);
		expect(result).not.toBe(FRAMEWORKS.vite);
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

		it("invalid framework still fails regardless of case", () => {
			expect(() => validateAndGetConfig("invalid", DEFAULTS)).toThrow();
			expect(() => validateAndGetConfig("INVALID", DEFAULTS)).toThrow();
			expect(() => validateAndGetConfig("Invalid", DEFAULTS)).toThrow();
			expect(() => validateAndGetConfig("astro", DEFAULTS)).toThrow();
			expect(() => validateAndGetConfig("ASTRO", DEFAULTS)).toThrow();
		});

		it("isValidFramework works with all cases", () => {
			expect(isValidFramework("vite")).toBe(true);
			expect(isValidFramework("VITE")).toBe(true);
			expect(isValidFramework("Vite")).toBe(true);
			expect(isValidFramework("invalid")).toBe(false);
			expect(isValidFramework("INVALID")).toBe(false);
		});
	});
});
