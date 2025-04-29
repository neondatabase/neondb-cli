#!/usr/bin/env node

import { intro, log, outro, select, spinner, text } from "@clack/prompts";
import { cristal } from "gradient-string";
import { instantNeon } from "./lib/instant-neon.js";
import { NeonProvider, NeonRegion, neonRegions } from "./lib/neon-schema.js";
import { INTRO_ART, messages } from "./lib/texts.js";
import { type Defaults } from "./lib/types.js";
import { getArgs } from "./lib/utils/args.js";
import { DEFAULTS } from "./lib/utils/args.js";
import { prepEnv } from "./lib/utils/fs.js";

async function main() {
	const {
		env: dotEnvFilePath,
		key: dotEnvKey,
		referrer,
		provider,
		region,
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

		if (!referrer) {
			userInput.referrer = (await text({
				message: messages.questions.referrer,
			})) as Defaults["referrer"];

			if (!userInput.referrer) {
				userInput.referrer = DEFAULTS.referrer;
				log.step(`using ${userInput.referrer} as the referrer`);
			}
		}

		if (process.env.NODE_ENV === "production") {
			if (!provider) {
				userInput.provider = (await select({
					message: messages.questions.provider,
					options: Object.keys(neonRegions).map((provider) => ({
						value: provider as NeonProvider,
						label: provider,
					})),
				})) as Defaults["provider"];

				if (!userInput.provider) {
					userInput.provider = DEFAULTS.provider;
					log.step(`using ${userInput.provider} as the provider`);
				}
			}

			if (!region) {
				userInput.region = (await select({
					message: messages.questions.region,
					options: neonRegions[userInput.provider].map((region) => ({
						value: region as NeonRegion,
						label: region,
					})),
				})) as Defaults["region"];

				if (!userInput.region) {
					userInput.region = DEFAULTS.region;
					log.step(`using ${userInput.region} as the region`);
				}
			}
		}

		prepEnv(userInput.dotEnvPath, userInput.dotEnvKey);

		s.start(messages.generating);
		await instantNeon({
			dotEnvFile: userInput.dotEnvPath,
			dotEnvKey: userInput.dotEnvKey,
			referrer: userInput.referrer,
		});
	}

	s.stop(messages.databaseGenerated);
	outro(messages.happyCoding);
}

await main();

export default main;
