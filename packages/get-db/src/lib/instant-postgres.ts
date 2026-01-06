import { randomUUID } from "node:crypto";
import { log } from "@clack/prompts";
import { seedDatabase } from "./seed-database.js";
import { messages } from "./texts.js";
import type { InstantPostgresParams } from "./types.js";
import { createClaimableDatabase } from "./utils/create-db.js";
import { getConnectionStrings } from "./utils/format.js";
import { writeToEnv } from "./utils/fs.js";
import { INSTAGRES_URLS } from "./utils/urls.js";

/**
 * Creates an instant Postgres connection string from Instagres by Neon
 * if not already set in the specified .env file.
 * Prompts the user to optionally generate a connection string,
 * saves it to the .env file, and returns the connection string.
 */
export const instantPostgres = async ({
	dotEnvFile = ".env",
	dotEnvKey = "DATABASE_URL",
	referrer,
	seed = undefined,
	envPrefix = "PUBLIC_",
	settings: { logicalReplication = false } = {},
}: InstantPostgresParams): Promise<{
	databaseUrlDirect: string;
	databaseUrl: string;
	claimUrl: string;
	claimExpiresAt: Date;
}> => {
	if (!referrer || referrer.trim() === "") {
		throw new Error(
			"referrer parameter is required.\n\n" +
				"The referrer helps track usage for the Instagres Affiliates Program.\n\n" +
				"Usage:\n" +
				"  instantPostgres({ referrer: 'your-app-name', dotEnvFile: '.env' })\n\n" +
				"Examples:\n" +
				"  referrer: 'npm:my-package-name'\n" +
				"  referrer: 'my-app-name'\n\n" +
				"For more information, visit: https://neon.com/docs/reference/instagres",
		);
	}

	const dbId = randomUUID();
	const claimExpiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
	const claimUrl = new URL(INSTAGRES_URLS.CLAIM_DATABASE(dbId));

	const connString = await createClaimableDatabase({
		dbId,
		referrer: `npm:get-db|${referrer}`,
		settings: { logicalReplication },
	});
	const { pooler: poolerString, direct: directString } =
		getConnectionStrings(connString);

	log.step(messages.connectionString(directString));
	log.step(messages.poolerString(poolerString));

	await writeToEnv(
		dotEnvFile,
		dotEnvKey,
		claimExpiresAt,
		claimUrl,
		directString,
		poolerString,
		envPrefix,
	);

	log.success(messages.envSuccess(dotEnvFile, dotEnvKey));
	log.info(messages.databaseGenerated(claimUrl.href));

	if (seed) {
		log.step("Pushing schema to database");
		await seedDatabase(seed.path, directString);
		log.success("Schema pushed to database");
	}

	return {
		databaseUrlDirect: directString,
		databaseUrl: poolerString,
		claimUrl: claimUrl.href,
		claimExpiresAt,
	} as const;
};

/**
 * @deprecated Use `instantPostgres` instead
 */
export const instantNeon = instantPostgres;

export type { InstantPostgresParams };

/**
 * @deprecated Use `InstantPostgresParams` instead
 */
export type InstantNeonParams = InstantPostgresParams;
