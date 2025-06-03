import { neonColumnTypeOptions } from "./neon-schema.js";
/**
 * Parameters for configuring Instagres database connection
 * @param {string} dotEnvFile - Path to the .env file where the connection string will be saved
 * @param {string} dotEnvKey - Environment variable name to store the connection string
 * @param {boolean} withPooler - Whether to use connection pooling
 * @param {string} referer - referrer name for tracking
 */
export interface InstantNeonParams {
	dotEnvFile?: string;
	dotEnvKey?: string;
	referrer?: string;
}

export interface Defaults {
	dotEnvPath: string;
	dotEnvKey: string;
}

export type NeonColumnTypes = (typeof neonColumnTypeOptions)[number]["value"];
