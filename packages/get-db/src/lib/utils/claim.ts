import { log, outro } from "@clack/prompts";
import open from "open";
import { getDotEnvContent } from "./fs.js";

function detectClaimUrlKey(
	dotEnvContent: Record<string, string>,
	dotEnvPath: string,
) {
	const claimUrlKey = Object.keys(dotEnvContent).find((key) =>
		key.endsWith("NEON_LAUNCHPAD_CLAIM_URL"),
	);

	if (!claimUrlKey) {
		log.error(`Claim URL not found in ${dotEnvPath}.`);
		log.info("Looking for any key ending with NEON_LAUNCHPAD_CLAIM_URL");
		outro("No claim URL found. Have you created a database yet?");
		process.exit(1);
	}

	const claimUrl = dotEnvContent[claimUrlKey];

	if (!claimUrl) {
		log.error(`${claimUrlKey} found but empty.`);
		outro(
			"Use `get-db claim -p {{ correct-prefix }}` to override URL auto-detection.",
		);
		process.exit(1);
	}

	return claimUrl;
}

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
			const claimUrl = detectClaimUrlKey(dotEnvContent, dotEnvPath);

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
