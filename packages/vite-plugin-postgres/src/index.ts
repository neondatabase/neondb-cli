import { resolve } from "node:path";
import { intro, log, outro } from "@clack/prompts";
import { type InstantNeonParams, instantNeon } from "neondb/launchpad";
import { loadEnv, type Plugin } from "vite";

const DEFAULTS = {
	dotEnvFile: ".env",
	dotEnvKey: "DATABASE_URL",
	referrer: "unknown",
	seed: undefined,
	envPrefix: "VITE_",
} satisfies InstantNeonParams;

type PostgresPluginOptions = Partial<InstantNeonParams> & {
	seed?: {
		type: "sql-script";
		path: string;
	};
};

let claimProcessStarted = false;

function postgresPlugin(options?: PostgresPluginOptions): Plugin {
	const {
		dotEnvFile: envPath,
		dotEnvKey: envKey,
		referrer,
		seed,
		envPrefix,
	} = {
		...DEFAULTS,
		...options,
	} satisfies InstantNeonParams;
	return {
		name: "@neondatabase/vite-plugin-postgres",
		enforce: "pre",

		async config({ root, envDir }, { mode }) {
			// Don't run in production to prevent accidental creation of a Neon database on CI
			if (mode === "production" || claimProcessStarted) return;

			const resolvedRoot = resolve(root ?? process.cwd());
			envDir = envDir ? resolve(resolvedRoot, envDir) : resolvedRoot;
			const resolvedEnvPath = resolve(
				envDir,
				envPath || DEFAULTS.dotEnvFile,
			);

			const envVars = loadEnv(mode, envDir, envKey);

			if (Object.keys(envVars).length > 0) {
				const envVar = envVars[envKey];
				if (!envVar) {
					log.info(
						`Environment variable ${envKey} not found in ${resolvedEnvPath}. We will create one for you.`,
					);
				} else {
					log.info(
						`Environment variable ${envKey} found in ${resolvedEnvPath}. If you wish to create a new Neon database, please remove the existing variable.`,
					);

					return;
				}
			}
			claimProcessStarted = true;

			intro("Setting up your project with a Neon database.");
			await instantNeon({
				dotEnvFile: envPath,
				dotEnvKey: envKey,
				referrer: `npm:@neondatabase/vite-plugin-postgres|${referrer}`,
				seed,
				envPrefix,
			});
			outro("Neon database created successfully.");
		},
	};
}

export { postgresPlugin as postgres };

/**
 * @deprecated the default export is deprecated, use the named export `postgres` instead.
 * @todo remove before v1.0.0
 */
export default postgresPlugin;
