import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getArgs } from "./args.js";

describe("getArgs", () => {
	const originalArgv = process.argv;
	const originalExit = process.exit;

	beforeEach(() => {
		// Mock process.exit to prevent test from exiting
		process.exit = vi.fn() as never;
		// Mock console.log to prevent output during tests
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		// Restore original values
		process.argv = originalArgv;
		process.exit = originalExit;
		vi.restoreAllMocks();
	});

	test("parses --ref flag with long form", () => {
		process.argv = ["node", "cli.js", "--ref", "custom-referrer"];

		const args = getArgs();

		expect(args.ref).toBe("custom-referrer");
	});

	test("parses -r flag with short form", () => {
		process.argv = ["node", "cli.js", "-r", "short-ref"];

		const args = getArgs();

		expect(args.ref).toBe("short-ref");
	});

	test("handles --ref flag with --yes flag", () => {
		process.argv = ["node", "cli.js", "--yes", "--ref", "ci-tool"];

		const args = getArgs();

		expect(args.yes).toBe(true);
		expect(args.ref).toBe("ci-tool");
	});

	test("handles --ref flag with other flags", () => {
		process.argv = [
			"node",
			"cli.js",
			"--env",
			".env.local",
			"--key",
			"PG_URL",
			"--ref",
			"vite-plugin",
		];

		const args = getArgs();

		expect(args.env).toBe(".env.local");
		expect(args.key).toBe("PG_URL");
		expect(args.ref).toBe("vite-plugin");
	});

	test("handles --ref flag with claim command", () => {
		process.argv = ["node", "cli.js", "claim", "--ref", "claim-tool"];

		const args = getArgs();

		expect(args.command).toBe("claim");
		expect(args.ref).toBe("claim-tool");
	});

	test("does not set ref when flag is not provided", () => {
		process.argv = ["node", "cli.js", "--yes"];

		const args = getArgs();

		expect(args.ref).toBeUndefined();
	});

	test("displays help text with --ref flag information", () => {
		process.argv = ["node", "cli.js", "--help"];

		getArgs();

		expect(console.log).toHaveBeenCalledWith(
			expect.stringContaining(
				"-r, --ref       Referrer identifier for tracking",
			),
		);
		expect(console.log).toHaveBeenCalledWith(
			expect.stringContaining('(default: "npm:get-db/cli")'),
		);
		expect(process.exit).toHaveBeenCalledWith(0);
	});

	test("handles all flags together including --ref", () => {
		process.argv = [
			"node",
			"cli.js",
			"--yes",
			"--env",
			".env.test",
			"--key",
			"TEST_DB_URL",
			"--seed",
			"./seed.sql",
			"--prefix",
			"APP_",
			"--ref",
			"test-runner",
		];

		const args = getArgs();

		expect(args.yes).toBe(true);
		expect(args.env).toBe(".env.test");
		expect(args.key).toBe("TEST_DB_URL");
		expect(args.seed).toBe("./seed.sql");
		expect(args.prefix).toBe("APP_");
		expect(args.ref).toBe("test-runner");
	});

	test("handles empty string as ref value", () => {
		process.argv = ["node", "cli.js", "--ref", ""];

		const args = getArgs();

		expect(args.ref).toBe("");
	});

	test("handles ref value with special characters", () => {
		process.argv = ["node", "cli.js", "--ref", "npm:my-package/v1.0.0"];

		const args = getArgs();

		expect(args.ref).toBe("npm:my-package/v1.0.0");
	});

	test("returns create as default command when no command provided", () => {
		process.argv = ["node", "cli.js"];

		const args = getArgs();

		expect(args.command).toBe("create");
	});

	test("parses claim command with no flags", () => {
		process.argv = ["node", "cli.js", "claim"];

		const args = getArgs();

		expect(args.command).toBe("claim");
	});

	describe("preset flag", () => {
		test("parses --preset flag with long form", () => {
			process.argv = ["node", "cli.js", "--preset", "vite"];

			const args = getArgs();

			expect(args.preset).toBe("vite");
		});

		test("parses -P flag with short form", () => {
			process.argv = ["node", "cli.js", "-P", "next"];

			const args = getArgs();

			expect(args.preset).toBe("next");
		});

		test("handles --preset flag with --yes flag", () => {
			process.argv = ["node", "cli.js", "--yes", "--preset", "nuxt"];

			const args = getArgs();

			expect(args.yes).toBe(true);
			expect(args.preset).toBe("nuxt");
		});

		test("handles --preset flag with other flags", () => {
			process.argv = [
				"node",
				"cli.js",
				"--env",
				".env.local",
				"--key",
				"PG_URL",
				"--preset",
				"vite",
			];

			const args = getArgs();

			expect(args.env).toBe(".env.local");
			expect(args.key).toBe("PG_URL");
			expect(args.preset).toBe("vite");
		});

		test("handles --preset flag with --prefix flag", () => {
			process.argv = [
				"node",
				"cli.js",
				"--preset",
				"vite",
				"--prefix",
				"CUSTOM_",
			];

			const args = getArgs();

			expect(args.preset).toBe("vite");
			expect(args.prefix).toBe("CUSTOM_");
		});

		test("handles --preset flag with claim command", () => {
			process.argv = ["node", "cli.js", "claim", "--preset", "next"];

			const args = getArgs();

			expect(args.command).toBe("claim");
			expect(args.preset).toBe("next");
		});

		test("does not set preset when flag is not provided", () => {
			process.argv = ["node", "cli.js", "--yes"];

			const args = getArgs();

			expect(args.preset).toBeUndefined();
		});

		test("displays help text with --preset flag information", () => {
			process.argv = ["node", "cli.js", "--help"];

			getArgs();

			expect(console.log).toHaveBeenCalledWith(
				expect.stringContaining(
					"-P, --preset    Framework preset (default, vite, next, nuxt)",
				),
			);
			expect(process.exit).toHaveBeenCalledWith(0);
		});

		test("handles all flags together including --preset", () => {
			process.argv = [
				"node",
				"cli.js",
				"--yes",
				"--env",
				".env.test",
				"--key",
				"TEST_DB_URL",
				"--seed",
				"./seed.sql",
				"--prefix",
				"APP_",
				"--preset",
				"vite",
				"--ref",
				"test-runner",
			];

			const args = getArgs();

			expect(args.yes).toBe(true);
			expect(args.env).toBe(".env.test");
			expect(args.key).toBe("TEST_DB_URL");
			expect(args.seed).toBe("./seed.sql");
			expect(args.prefix).toBe("APP_");
			expect(args.preset).toBe("vite");
			expect(args.ref).toBe("test-runner");
		});

		test("handles empty string as preset value", () => {
			process.argv = ["node", "cli.js", "--preset", ""];

			const args = getArgs();

			expect(args.preset).toBe("");
		});

		test("handles preset value with special characters", () => {
			process.argv = ["node", "cli.js", "--preset", "custom-preset"];

			const args = getArgs();

			expect(args.preset).toBe("custom-preset");
		});

		test("accepts preset with any case", () => {
			process.argv = ["node", "cli.js", "--preset", "VITE"];

			const args = getArgs();

			// getArgs doesn't normalize, just parses
			// Normalization happens in validateAndGetConfig
			expect(args.preset).toBe("VITE");
		});

		test("handles short form -P with multiple flags", () => {
			process.argv = [
				"node",
				"cli.js",
				"-P",
				"next",
				"-y",
				"-e",
				".env.prod",
			];

			const args = getArgs();

			expect(args.preset).toBe("next");
			expect(args.yes).toBe(true);
			expect(args.env).toBe(".env.prod");
		});

		test("preset flag accepts any string value", () => {
			process.argv = ["node", "cli.js", "--preset", "invalid-preset"];

			const args = getArgs();

			// getArgs doesn't validate, just parses
			expect(args.preset).toBe("invalid-preset");
		});

		test("handles both -P and --preset in the same command", () => {
			// In parseArgs, the last value wins
			process.argv = ["node", "cli.js", "-P", "vite", "--preset", "next"];

			const args = getArgs();

			// The second value should take precedence
			expect(args.preset).toBe("next");
		});
	});
});
