import { randomUUID } from "node:crypto";
import { log } from "@clack/prompts";
import { messages } from "./texts.js";
import { InstantNeonParams } from "./types.js";
import { createClaimableDatabase } from "./utils/create-db.js";
import { getPoolerString } from "./utils/format.js";
import { writeToEnv } from "./utils/fs.js";
import { LAUNCHPAD_URLS } from "./utils/urls.js";
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
	const claimUrl = new URL(
		LAUNCHPAD_URLS.CREATE_CLAIMABLE_DATABASE(dbId, referrer),
	);
	log.step(messages.botCheck(claimUrl.href));
	const connString = await createClaimableDatabase(dbId, claimUrl);
	const poolerString = getPoolerString(connString);

	log.step(messages.connectionString(connString));
	log.step(messages.poolerString(poolerString));

	await writeToEnv(
		dotEnvFile,
		dotEnvKey,
		claimExpiresAt,
		claimUrl,
		connString,
		poolerString,
	);

	log.success(messages.envSuccess(dotEnvFile, dotEnvKey));

	return {
		databaseUrl: connString,
		poolerUrl: poolerString,
		claimUrl: claimUrl.href,
		claimExpiresAt,
	} as const;
};
