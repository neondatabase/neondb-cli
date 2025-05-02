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
export default function postgresPlugin(
	options?: Partial<PostgresPluginOptions>,
): VitePlugin {
	const { env: envPath, envKey } = { ...DEFAULTS, ...options };
	return {
		name: "@neondatabase/vite-plugin-postgres",
		async config({ root, envDir }, { mode }) {
			const resolvedRoot = resolve(root ?? process.cwd());
			envDir = envDir ? resolve(resolvedRoot, envDir) : resolvedRoot;
			const resolvedEnvPath = resolve(envDir, envPath);

			const envVars = loadEnv(mode, envDir, envKey);

			if (Object.keys(envVars).length > 0) {
				const envVar = envVars[envKey];
				if (!envVar) {
					console.info(
						`Environment variable ${envKey} not found in ${resolvedEnvPath}. We will create one for you.`,
					);
				} else {
					console.info(
						`Environment variable ${envKey} found in ${resolvedEnvPath}. If you wish to create a new Neon database, please remove the existing variable.`,
					);

					return;
				}
			}

			await instantNeon({
				dotEnvFile: envPath,
				dotEnvKey: envKey,
				referrer: "@neondatabase/vite-plugin-postgres",
			});
		},
	};
}
