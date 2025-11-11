#!/usr/bin/env node

import { intro, isCancel, log, outro, spinner, text } from "@clack/prompts";
import { cristal } from "gradient-string";
import { claim } from "./lib/claim-command.js";
import { instantNeon } from "./lib/instant-postgres.js";
import { INTRO_ART, messages } from "./lib/texts.js";
import type { Defaults } from "./lib/types.js";
import { DEFAULTS, getArgs } from "./lib/utils/args.js";
import { prepEnv } from "./lib/utils/fs.js";
import { validateEnvKey, validateEnvPath } from "./lib/utils/validate.js";

async function main() {
	const { command, yes: shouldUseDefaults, ...flags } = getArgs();

	// Handle claim command
	if (command === "claim") {
		const envPath = flags.env || DEFAULTS.dotEnvPath;
		await claim(envPath, flags.prefix);
		return;
	}

	console.log(cristal(INTRO_ART));
	const s = spinner();

	intro(messages.welcome);
	log.info(messages.nonInteractive);
	const userInput: Partial<Defaults> = {};

	if (shouldUseDefaults) {
		const envPath = flags.env || DEFAULTS.dotEnvPath;
		const envKey = flags.key || DEFAULTS.dotEnvKey;
		const envPrefix = flags.prefix || DEFAULTS.envPrefix;

		prepEnv(envPath, envKey);
		s.start(messages.generating);

		const seedConfig = flags.seed
			? { type: "sql-script" as const, path: flags.seed }
			: DEFAULTS.seed;

		await instantNeon({
			dotEnvFile: envPath,
			dotEnvKey: envKey,
			referrer: "npm:get-db/cli",
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
				message: messages.questions.dotEnvFilePath,
				validate: validateEnvPath,
			})) as Defaults["dotEnvPath"];

			// user cancelled with CTRL+C
			if (isCancel(userInput.dotEnvPath)) {
				outro(messages.info.userCancelled);
				process.exit(1);
			}

			// user entered an empty string -- opted for default value.
			if (!userInput.dotEnvPath) {
				userInput.dotEnvPath = DEFAULTS.dotEnvPath;
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
				message: messages.questions.dotEnvKey,
				validate: validateEnvKey,
			})) as Defaults["dotEnvKey"];

			// user cancelled with CTRL+C
			if (isCancel(userInput.dotEnvKey)) {
				outro(messages.info.userCancelled);
				process.exit(1);
			}

			// User accepted default value.
			if (!userInput.dotEnvKey) {
				userInput.dotEnvKey = DEFAULTS.dotEnvKey;
				log.step(messages.info.defaultEnvKey(userInput.dotEnvKey));
			}
		}

		if (!flags.seed) {
			userInput.seed = {
				type: "sql-script",
				path: await text({
					message: messages.questions.seedPath,
				}),
			} as Defaults["seed"];

			if (!userInput.seed?.path) {
				userInput.seed = DEFAULTS.seed;
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
				message: messages.questions.prefix,
			})) as Defaults["envPrefix"];

			// user cancelled with CTRL+C
			if (isCancel(userInput.envPrefix)) {
				outro(messages.info.userCancelled);
				process.exit(1);
			}

			// User accepted default value.
			if (!userInput.envPrefix) {
				userInput.envPrefix = DEFAULTS.envPrefix;
				log.step(messages.info.defaultPrefix(userInput.envPrefix));
			}
		}

		prepEnv(userInput.dotEnvPath, userInput.dotEnvKey);

		s.start(messages.generating);

		await instantNeon({
			dotEnvFile: userInput.dotEnvPath,
			dotEnvKey: userInput.dotEnvKey,
			referrer: "npm:get-db/cli",
			seed: userInput.seed,
			envPrefix: userInput.envPrefix,
		});
	}
	s.stop("Database generated!");

	outro(messages.happyCoding);
}

await main();

export default main;
