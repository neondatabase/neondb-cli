#!/usr/bin/env node

import { intro, log, outro, select, spinner, text } from "@clack/prompts";
import { cristal } from "gradient-string";
import { instantNeon } from "./lib/instant-neon.js";
import { NeonProvider, NeonRegion, neonRegions } from "./lib/neon-schema.js";
import { INTRO_ART, messages } from "./lib/texts.js";
import { type Defaults } from "./lib/types.js";
import { DEFAULTS, getArgs } from "./lib/utils/args.js";
import { prepEnv } from "./lib/utils/fs.js";

async function main() {
	const {
		env: dotEnvFilePath,
		key: dotEnvKey,
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
			referrer: DEFAULTS.referrer,
		});
	} else {
		const userInput: Defaults = {
			dotEnvPath: DEFAULTS.dotEnvPath,
			dotEnvKey: DEFAULTS.dotEnvKey,
			referrer: DEFAULTS.referrer,
			provider: DEFAULTS.provider,
			region: DEFAULTS.region,
		};

		if (!dotEnvFilePath) {
			userInput.dotEnvPath = (await text({
				message: messages.questions.dotEnvFilePath,
			})) as Defaults["dotEnvPath"];

			if (!userInput.dotEnvPath) {
				userInput.dotEnvPath = DEFAULTS.dotEnvPath;
				log.step(`using ${userInput.dotEnvPath} as the .env file`);
			}
		}

		if (!dotEnvKey) {
			userInput.dotEnvKey = (await text({
				message: messages.questions.dotEnvKey,
			})) as Defaults["dotEnvKey"];

			if (!userInput.dotEnvKey) {
				userInput.dotEnvKey = DEFAULTS.dotEnvKey;
				log.step(`using ${userInput.dotEnvKey} as the .env key`);
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
