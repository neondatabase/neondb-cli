#!/usr/bin/env node

import { intro, isCancel, log, outro, spinner, text } from "@clack/prompts";
import { cristal } from "gradient-string";
import { instantNeon } from "./lib/instant-neon.js";
import { INTRO_ART, messages } from "./lib/texts.js";
import { type Defaults } from "./lib/types.js";
import { DEFAULTS, getArgs } from "./lib/utils/args.js";
import { prepEnv } from "./lib/utils/fs.js";
import { validateEnvKey, validateEnvPath } from "./lib/utils/validate.js";

async function main() {
	const {
		env: flagEnvPath,
		key: flagEnvKey,
		sql: flagSeedPath,
		yes: shouldUseDefaults,
	} = getArgs();

	console.log(cristal(INTRO_ART));
	const s = spinner();

	intro(messages.welcome);
	const userInput: Partial<Defaults> = {};

	if (shouldUseDefaults) {
		prepEnv(DEFAULTS.dotEnvPath, DEFAULTS.dotEnvKey);
		s.start(messages.generating);

		await instantNeon({
			dotEnvFile: DEFAULTS.dotEnvPath,
			dotEnvKey: DEFAULTS.dotEnvKey,
		});
	} else {
		/**
		 * Get Env file path (e.g.: .env)
		 */
		if (flagEnvPath) {
			const isEnvPathInvalid = validateEnvPath(flagEnvPath);

			if (isEnvPathInvalid) {
				log.error(isEnvPathInvalid.message);
				process.exit(1);
			}

			log.step(messages.info.defaultEnvFilePath(flagEnvPath));
			userInput.dotEnvPath = flagEnvPath;
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
		if (flagEnvKey) {
			const isEnvKeyInvalid = validateEnvKey(flagEnvKey);
			if (isEnvKeyInvalid) {
				log.error(isEnvKeyInvalid.message);
				process.exit(1);
			}
			log.step(messages.info.defaultEnvKey(flagEnvKey));
			userInput.dotEnvKey = flagEnvKey;
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
				log.step(`using ${userInput.dotEnvKey} as the .env key`);
			}
		}

		if (!flagSeedPath) {
			userInput.seed = {
				type: "sql-script",
				path: await text({
					message: messages.questions.seedPath,
				}),
			} as Defaults["seed"];

			if (!userInput.seed?.path) {
				userInput.seed = DEFAULTS.seed;
			}
		}

		prepEnv(userInput.dotEnvPath, userInput.dotEnvKey);

		s.start(messages.generating);
		await instantNeon({
			dotEnvFile: userInput.dotEnvPath,
			dotEnvKey: userInput.dotEnvKey,
			referrer: "npm:neondb/cli",
			seed: userInput.seed,
		});
	}
	s.stop("Database generated!");

	outro(messages.happyCoding);
}

await main();

export default main;
