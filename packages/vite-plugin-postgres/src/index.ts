import { intro, note, outro } from "@clack/prompts";
import { instantNeon } from "neondb/sdk";
import { resolve } from "path";
import { loadEnv, type Plugin as VitePlugin } from "vite";

interface PostgresPluginOptions {
	env: string;
	envKey: string;
}

const DEFAULTS: PostgresPluginOptions = {
	env: ".env",
	envKey: "DATABASE_URL",
};

let claimProcessStarted = false;

export default function postgresPlugin(
	options?: Partial<PostgresPluginOptions>,
): VitePlugin {
	const { env: envPath, envKey } = { ...DEFAULTS, ...options };
	return {
		name: "@neondatabase/vite-plugin-postgres",

		async config({ root, envDir }, { mode }) {
			// Don't run in production to prevent accidental creation of a Neon database on CI
			if (mode === "production" || claimProcessStarted) return;

			const resolvedRoot = resolve(root ?? process.cwd());
			envDir = envDir ? resolve(resolvedRoot, envDir) : resolvedRoot;
			const resolvedEnvPath = resolve(envDir, envPath);

			const envVars = loadEnv(mode, envDir, envKey);

			if (Object.keys(envVars).length > 0) {
				const envVar = envVars[envKey];
				if (!envVar) {
					note(
						`Environment variable ${envKey} not found in ${resolvedEnvPath}. We will create one for you.`,
					);
				} else {
					note(
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
				referrer: "@neondatabase/vite-plugin-postgres",
			});
			outro("Neon database created successfully.");
		},
	};
}
