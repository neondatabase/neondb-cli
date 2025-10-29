import { log, outro } from "@clack/prompts";
import open from "open";
import { detectClaimUrl } from "./utils/detect-claim-url.js";
import { getDotEnvContent } from "./utils/fs.js";

export async function claim(
	dotEnvPath: string,
	envPrefix?: string,
): Promise<void> {
	try {
		const dotEnvContent = getDotEnvContent(dotEnvPath);
		let claimUrlKey: string | undefined;
		let claimUrl: string | undefined;

		if (envPrefix) {
			claimUrlKey = `${envPrefix}NEON_LAUNCHPAD_CLAIM_URL`;
			claimUrl = dotEnvContent[claimUrlKey];

			if (!claimUrl) {
				log.error(`${claimUrlKey} not found in ${dotEnvPath}. `);
				outro(
					`Use \`get-db claim -p {{ correct-prefix }}\` to override URL auto-detection.`,
				);
				process.exit(1);
			}
		} else {
			const claimUrl = detectClaimUrl(dotEnvContent, dotEnvPath);

			log.success(`URL located. Opening your default browser.`);
			await open(claimUrl);
			outro(`You can also manually open: ${claimUrl}.`);
		}
	} catch (error) {
		log.error(
			error instanceof Error ? error.message : "Failed to open claim URL",
		);
		process.exit(1);
	}
}
