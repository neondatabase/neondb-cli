import { randomUUID } from "node:crypto";
import { log } from "@clack/prompts";
import { seedDatabase } from "./seed-database.js";
import { messages } from "./texts.js";
import type { InstantNeonParams } from "./types.js";
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
	seed = undefined,
}: InstantNeonParams) => {
	const dbId = randomUUID();
	const claimExpiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
	const createDbUrl = new URL(
		LAUNCHPAD_URLS.CREATE_CLAIMABLE_DATABASE(
			dbId,
			`npm:neondb|${referrer}`,
		),
	);
	const claimUrl = new URL(LAUNCHPAD_URLS.CLAIM_DATABASE(dbId));
	log.step(messages.botCheck(createDbUrl.href));

	const connString = await createClaimableDatabase(
		dbId,
		`npm:neondb|${referrer}`,
	);
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
	log.info(messages.databaseGenerated(claimUrl.href));

	if (seed) {
		log.step("Pushing schema to database");
		await seedDatabase(seed.path, connString);
		log.success("Schema pushed to database");
	}

	return {
		databaseUrl: connString,
		poolerUrl: poolerString,
		claimUrl: claimUrl.href,
		claimExpiresAt,
	} as const;
};

export type { InstantNeonParams };
