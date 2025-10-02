import { log, outro } from "@clack/prompts";
import open from "open";
import { getDotEnvContent } from "./fs.js";

export async function claim(
	dotEnvPath: string,
	envPrefix: string,
): Promise<void> {
	try {
		const dotEnvContent = getDotEnvContent(dotEnvPath);
		const claimUrlKey = `${envPrefix}NEON_LAUNCHPAD_CLAIM_URL`;
		const claimUrl = dotEnvContent[claimUrlKey];

		if (!claimUrl) {
			log.error(
				`Claim URL not found in ${dotEnvPath}. Looking for key: ${claimUrlKey}`,
			);
			outro("No claim URL found. Have you created a database yet?");
			process.exit(1);
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
