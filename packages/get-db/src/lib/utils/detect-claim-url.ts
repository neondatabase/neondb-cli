import { log, outro } from "@clack/prompts";

export function detectClaimUrl(
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
			"Use `get-db claim -p <prefix>` to override URL auto-detection. For example, use `get-db claim -p PROD_` if your key is `PROD_NEON_LAUNCHPAD_CLAIM_URL`.",
		);
		process.exit(1);
	}

	return claimUrl;
}
