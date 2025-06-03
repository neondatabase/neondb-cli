#!/usr/bin/env node

import { intro, log, outro, select, spinner, text } from "@clack/prompts";
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
		yes: shouldUseDefaults,
	} = getArgs();

	console.log(cristal(INTRO_ART));
	const s = spinner();

	intro(messages.welcome);

	if (shouldUseDefaults) {
		prepEnv(DEFAULTS.dotEnvPath, DEFAULTS.dotEnvKey);
		s.start(messages.generating);

		await instantNeon({
			dotEnvFile: DEFAULTS.dotEnvPath,
			dotEnvKey: DEFAULTS.dotEnvKey,
		});
	} else {
		const userInput: Defaults = {
			dotEnvPath: DEFAULTS.dotEnvPath,
			dotEnvKey: DEFAULTS.dotEnvKey,
		};

		if (flagEnvPath) {
			log.step(`using ${flagEnvPath} as the .env file`);
			userInput.dotEnvPath = flagEnvPath;
		} else {
			userInput.dotEnvPath = (await text({
				message: messages.questions.dotEnvFilePath,
				validate: validateEnvPath,
			})) as Defaults["dotEnvPath"];

			if (!userInput.dotEnvPath) {
				userInput.dotEnvPath = DEFAULTS.dotEnvPath;
				log.step(`using ${userInput.dotEnvPath} as the .env file`);
			}
		} else {
			const isEnvPathInvalid = validateEnvPath(dotEnvFilePath);
			if (isEnvPathInvalid) {
				log.error(isEnvPathInvalid.message);
				process.exit(1);
			}
			userInput.dotEnvPath = dotEnvFilePath;
		}

		if (flagEnvKey) {
			log.step(`using ${flagEnvKey} as the .env key`);
			userInput.dotEnvKey = flagEnvKey;
		} else {
			userInput.dotEnvKey = (await text({
				message: messages.questions.dotEnvKey,
				validate: validateEnvKey,
			})) as Defaults["dotEnvKey"];

			if (!userInput.dotEnvKey) {
				userInput.dotEnvKey = DEFAULTS.dotEnvKey;
				log.step(`using ${userInput.dotEnvKey} as the .env key`);
			}
		} else {
			const isEnvKeyInvalid = validateEnvKey(dotEnvKey);
			if (isEnvKeyInvalid) {
				log.error(isEnvKeyInvalid.message);
				process.exit(1);
			}
		}

		prepEnv(userInput.dotEnvPath, userInput.dotEnvKey);

		s.start(messages.generating);
		await instantNeon({
			dotEnvFile: userInput.dotEnvPath,
			dotEnvKey: userInput.dotEnvKey,
			referrer: "neondb-cli",
		});
	}

	s.stop();
	outro(messages.happyCoding);
}

await main();

export default main;
