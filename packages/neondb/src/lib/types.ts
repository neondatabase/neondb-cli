/**
 * Parameters for configuring Instagres database connection
 * @param {string} dotEnvFile - Path to the .env file where the connection string will be saved
 * @param {string} dotEnvKey - Environment variable name to store the connection string
 * @param {boolean} withPooler - Whether to use connection pooling
 * @param {string} referer - referrer name for tracking
 * @param {string} seedPath - Path to the `.sql` file to be pushed to the database
 */
export interface InstantNeonParams {
	dotEnvFile?: string;
	dotEnvKey?: string;
	referrer?: string;
	seedPath?: string | undefined;
}

export interface Defaults {
	dotEnvPath: string;
	dotEnvKey: string;
	seedPath?: string | undefined;
}
