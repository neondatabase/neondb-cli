import { log, outro } from "@clack/prompts";
import open from "open";
import { getDotEnvContent } from "./fs.js";

export async function claim(
	dotEnvPath: string,
	envPrefix?: string,
): Promise<void> {
	try {
		const dotEnvContent = getDotEnvContent(dotEnvPath);
		let claimUrlKey: string | undefined;
		let claimUrl: string | undefined;

		// If prefix is explicitly provided, use it to construct the exact key
		if (envPrefix) {
			claimUrlKey = `${envPrefix}NEON_LAUNCHPAD_CLAIM_URL`;
			claimUrl = dotEnvContent[claimUrlKey];

			if (!claimUrl) {
				log.error(
					`Claim URL not found in ${dotEnvPath}. Looking for key: ${claimUrlKey}`,
				);
				outro("No claim URL found. Have you created a database yet?");
				process.exit(1);
			}
		} else {
			// Auto-detect: find any key ending with NEON_LAUNCHPAD_CLAIM_URL
			claimUrlKey = Object.keys(dotEnvContent).find((key) =>
				key.endsWith("NEON_LAUNCHPAD_CLAIM_URL"),
			);

			if (!claimUrlKey) {
				log.error(`Claim URL not found in ${dotEnvPath}.`);
				log.info(
					"Looking for any key ending with NEON_LAUNCHPAD_CLAIM_URL",
				);
				outro("No claim URL found. Have you created a database yet?");
				process.exit(1);
			}

			claimUrl = dotEnvContent[claimUrlKey];

			if (!claimUrl) {
				log.error(
					`Claim URL key found but value is empty: ${claimUrlKey}`,
				);
				outro("No claim URL found. Have you created a database yet?");
				process.exit(1);
			}
		}

		log.success(`Opening claim URL: ${claimUrl}`);
		await open(claimUrl);
		outro("Claim URL opened in your browser!");
	} catch (error) {
		log.error(
			error instanceof Error ? error.message : "Failed to open claim URL",
		);
		process.exit(1);
	}
}
