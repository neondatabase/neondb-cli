import { resolve } from "node:path";
import { intro, log, outro } from "@clack/prompts";
import { type InstantPostgresParams, instantPostgres } from "get-db";
import { loadEnv, type Plugin } from "vite";

const DEFAULTS = {
	dotEnvFile: ".env",
	dotEnvKey: "DATABASE_URL",
	referrer: "unknown",
	seed: undefined,
	envPrefix: "VITE_",
} satisfies InstantPostgresParams;

type PostgresPluginOptions = Partial<InstantPostgresParams> & {
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
	} satisfies InstantPostgresParams;
	return {
		name: "vite-plugin-db",
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
			await instantPostgres({
				dotEnvFile: envPath,
				dotEnvKey: envKey,
				referrer: `npm:vite-plugin-db|${referrer}`,
				seed,
				envPrefix,
			});
			outro("Neon database created successfully.");
		},
	};
}

export { postgresPlugin as postgres };
export default postgresPlugin;
