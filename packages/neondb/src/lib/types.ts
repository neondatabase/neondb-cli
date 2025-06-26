export type SqlScript = {
	type: "sql-script";
	path: string;
};

/**
 * Parameters for configuring Instagres database connection
 * @param {string} dotEnvFile - Path to the .env file where the connection string will be saved
 * @param {string} dotEnvKey - Environment variable name to store the connection string
 * @param {string} referrer - referrer name for tracking
 * @param {SqlScript} seed - Path to the `.sql` file to be pushed to the database
 */
export interface InstantNeonParams {
	dotEnvFile?: string;
	dotEnvKey?: string;
	referrer?: string;
	seed?: SqlScript;
}

export interface Defaults {
	dotEnvPath: string;
	dotEnvKey: string;
	seed?: SqlScript;
}
