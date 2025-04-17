import { randomUUID } from "node:crypto";
import { appendFile } from "node:fs/promises";
import { log } from "@clack/prompts";
import open from "open";
import pWaitFor from "p-wait-for";
import { messages } from "./texts.js";
import { InstantNeonParams } from "./types.js";

const INSTANT_NEON_URLS = {
	API: (dbId: string) => `https://www.instagres.com/api/v1/databases/${dbId}`,
	CLAIM_URL: (dbId: string, referrer?: string) =>
		`https://neon-new.vercel.app/claim/${dbId}${
			referrer ? `?ref=${referrer}` : ""
		}`,
};

function getPoolerString(connString: string) {
	const [start, ...end] = connString.split(".");
	return `${start}-pooler.${end.join(".")}`;
}

async function createClaimableDatabase(dbId: string, claimUrl: URL) {
	void open(claimUrl.href);

	const connString = await pWaitFor<string>(
		async () => {
			const res = await fetch(INSTANT_NEON_URLS.API(dbId));
			if (!res.ok) return false;
			return pWaitFor.resolveWith(
				((await res.json()) as { connectionString: string })
					.connectionString,
			);
		},
		{ before: false, interval: 2000 },
	);

	return connString;
}

/**
 * Creates an instant Postgres connection string from Instagres by Neon
 * if not already set in the specified .env file.
 * Prompts the user to optionally generate a connection string,
 * saves it to the .env file, and returns the connection string.
 */
export const instantNeon = async ({
	dotEnvFile = ".env",
	dotEnvKey = "DATABASE_URL",
	referrer = "unknown",
}: InstantNeonParams) => {
	const dbId = randomUUID();
	const claimExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	const claimUrl = new URL(INSTANT_NEON_URLS.CLAIM_URL(dbId, referrer));
	log.step(messages.botCheck(claimUrl.href));
	const connString = await createClaimableDatabase(dbId, claimUrl);
	const poolerString = getPoolerString(connString);

	log.step(messages.connectionString(connString));
	log.step(messages.poolerString(poolerString));

	appendFile(
		dotEnvFile,
		`

# Claimable DB expires at: ${claimExpiresAt.toUTCString()}
# Claim it now to your account: ${claimUrl.href}
${dotEnvKey}=${connString}
${dotEnvKey}_POOLER=${poolerString}
`,
	);

	log.success(messages.envSuccess(dotEnvFile, dotEnvKey));

	return {
		databaseUrl: connString,
		poolerUrl: poolerString,
		claimUrl: claimUrl.href,
		claimExpiresAt,
	} as const;
};
