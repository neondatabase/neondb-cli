#!/usr/bin/env node

import {
	intro,
	isCancel,
	log,
	outro,
	select,
	spinner,
	text,
} from "@clack/prompts";
import { cristal } from "gradient-string";
import { claim } from "./lib/claim-command.js";
import { validateAndGetConfig } from "./lib/frameworks.js";
import { instantPostgres } from "./lib/instant-postgres.js";
import { INTRO_ART, messages } from "./lib/texts.js";
import type { Defaults } from "./lib/types.js";
import { DEFAULTS, getArgs } from "./lib/utils/args.js";
import { prepEnv } from "./lib/utils/fs.js";
import { validateEnvKey, validateEnvPath } from "./lib/utils/validate.js";

async function main() {
	const { command, yes: shouldUseDefaults, ...flags } = getArgs();

	// Handle claim command early (before framework selection)
	if (command === "claim") {
		// For claim command, we need config for defaults
		let claimConfig: Defaults;
		try {
			claimConfig = validateAndGetConfig(flags.framework, DEFAULTS);
		} catch (error) {
			if (error instanceof Error) {
				log.error(error.message);
			}
			process.exit(1);
		}
		const envPath = flags.env || claimConfig.dotEnvPath;
		await claim(envPath, flags.prefix);
		return;
	}

	// Show intro art
	console.log(cristal(INTRO_ART));
	const s = spinner();

	// Determine framework selection
	let selectedFramework: string | undefined = flags.framework;

	// Interactive mode: show welcome and prompt for framework
	if (!shouldUseDefaults) {
		intro(messages.welcome);
		log.info(messages.nonInteractive);

		// Framework selection prompt (if not provided via -f flag)
		if (!selectedFramework) {
			selectedFramework = (await select({
				message: "Select a framework (or custom for full control):",
				options: [
					{
						value: "default",
						label: "Default",
						hint: "PUBLIC_ prefix",
					},
					{ value: "vite", label: "Vite", hint: "VITE_ prefix" },
					{
						value: "next",
						label: "Next.js",
						hint: "NEXT_PUBLIC_ prefix",
					},
					{
						value: "nuxt",
						label: "Nuxt",
						hint: "NUXT_PUBLIC_ prefix",
					},
					{
						value: "custom",
						label: "Custom",
						hint: "Configure everything manually",
					},
				],
				initialValue: "default",
			})) as string;

			// Handle cancellation
			if (isCancel(selectedFramework)) {
				outro(messages.info.userCancelled);
				process.exit(1);
			}
		}
	}

	// Validate and apply framework configuration
	let config: Defaults;
	const isCustomMode = selectedFramework === "custom";

	if (isCustomMode) {
		// Custom mode: use base DEFAULTS without framework override
		config = DEFAULTS;
	} else {
		// Apply framework configuration
		try {
			config = validateAndGetConfig(selectedFramework, DEFAULTS);
		} catch (error) {
			if (error instanceof Error) {
				log.error(error.message);
			}
			process.exit(1);
		}
	}

	const userInput: Partial<Defaults> = {};

	if (shouldUseDefaults) {
		const envPath = flags.env || config.dotEnvPath;
		const envKey = flags.key || config.dotEnvKey;
		const envPrefix = flags.prefix || config.envPrefix;
		const referrer = flags.ref || config.referrer;

		prepEnv(envPath, envKey);
		s.start(messages.generating);

		const seedConfig = flags.seed
			? { type: "sql-script" as const, path: flags.seed }
			: config.seed;

		await instantPostgres({
			dotEnvFile: envPath,
			dotEnvKey: envKey,
			referrer,
			seed: seedConfig,
			envPrefix: envPrefix,
		});
	} else {
		/**
		 * Get Env file path (e.g.: .env)
		 */
		if (flags.env) {
			const isEnvPathInvalid = validateEnvPath(flags.env);

			if (isEnvPathInvalid) {
				log.error(isEnvPathInvalid.message);
				process.exit(1);
			}

			log.step(messages.info.defaultEnvFilePath(flags.env));
			userInput.dotEnvPath = flags.env;
		} else {
			userInput.dotEnvPath = (await text({
				message: messages.questions(config).dotEnvFilePath,
				validate: validateEnvPath,
			})) as Defaults["dotEnvPath"];

			// user cancelled with CTRL+C
			if (isCancel(userInput.dotEnvPath)) {
				outro(messages.info.userCancelled);
				process.exit(1);
			}

			// user entered an empty string -- opted for default value.
			if (!userInput.dotEnvPath) {
				userInput.dotEnvPath = config.dotEnvPath;
				log.step(
					messages.info.defaultEnvFilePath(userInput.dotEnvPath),
				);
			}
		}

		// Always set dotEnvKey from flag if present
		if (flags.key) {
			const isEnvKeyInvalid = validateEnvKey(flags.key);
			if (isEnvKeyInvalid) {
				log.error(isEnvKeyInvalid.message);
				process.exit(1);
			}
			log.step(messages.info.defaultEnvKey(flags.key));
			userInput.dotEnvKey = flags.key;
		}

		// Prompt for dotEnvKey if not set by flag
		if (!userInput.dotEnvKey) {
			userInput.dotEnvKey = (await text({
				message: messages.questions(config).dotEnvKey,
				validate: validateEnvKey,
			})) as Defaults["dotEnvKey"];

			// user cancelled with CTRL+C
			if (isCancel(userInput.dotEnvKey)) {
				outro(messages.info.userCancelled);
				process.exit(1);
			}

			// User accepted default value.
			if (!userInput.dotEnvKey) {
				userInput.dotEnvKey = config.dotEnvKey;
				log.step(messages.info.defaultEnvKey(userInput.dotEnvKey));
			}
		}

		if (!flags.seed) {
			userInput.seed = {
				type: "sql-script",
				path: await text({
					message: messages.questions(config).seedPath,
				}),
			} as Defaults["seed"];

			if (!userInput.seed?.path) {
				userInput.seed = config.seed;
			}
		} else {
			userInput.seed = {
				type: "sql-script",
				path: flags.seed,
			};
		}

		// Always set envPrefix from flag if present
		if (flags.prefix) {
			log.step(messages.info.defaultPrefix(flags.prefix));
			userInput.envPrefix = flags.prefix;
		}

		// Prompt for envPrefix if not set by flag
		if (!userInput.envPrefix) {
			userInput.envPrefix = (await text({
				message: messages.questions(config).prefix,
			})) as Defaults["envPrefix"];

			// user cancelled with CTRL+C
			if (isCancel(userInput.envPrefix)) {
				outro(messages.info.userCancelled);
				process.exit(1);
			}

			// User accepted default value.
			if (!userInput.envPrefix) {
				userInput.envPrefix = config.envPrefix;
				log.step(messages.info.defaultPrefix(userInput.envPrefix));
			}
		}

		prepEnv(userInput.dotEnvPath, userInput.dotEnvKey);

		s.start(messages.generating);

		const referrer = flags.ref || config.referrer;

		await instantPostgres({
			dotEnvFile: userInput.dotEnvPath,
			dotEnvKey: userInput.dotEnvKey,
			referrer,
			seed: userInput.seed,
			envPrefix: userInput.envPrefix,
		});
	}
	s.stop("Database generated!");

	outro(messages.happyCoding);
}

await main();

export default main;
