import { parseArgs } from "node:util";
import type { Defaults } from "../types.js";

export const DEFAULTS: Defaults = {
	dotEnvPath: "./.env",
	dotEnvKey: "DATABASE_URL",
	seed: undefined,
	envPrefix: "PUBLIC_",
};

export function getArgs() {
	const { values, positionals } = parseArgs({
		options: {
			yes: {
				type: "boolean",
				short: "y",
				default: false,
			},
			env: {
				type: "string",
				short: "e",
			},
			key: {
				type: "string",
				short: "k",
			},
			seed: {
				type: "string",
				short: "s",
			},
			prefix: {
				type: "string",
				short: "p",
			},
			help: {
				type: "boolean",
				short: "h",
			},
		},
		allowPositionals: true,
	});

	if (values.help) {
		console.log(`
Usage: get-db [command] [options]

Commands:
  (default)       Create a new database (default command)
  claim           Open the claim URL from your .env file

Options:
  -y, --yes       Skip all prompts and use defaults
  -e, --env       Path to the .env file (default: "${DEFAULTS.dotEnvPath}")
  -k, --key       Key for the database connection string (default: "${
		DEFAULTS.dotEnvKey
  }")
  -s, --seed      Path to the seed (.sql) file (default: "${
		DEFAULTS.seed?.path || "none"
  }")
  -p, --prefix    Prefix for public environment variables (default: "${
		DEFAULTS.envPrefix
  }")
  -h, --help      Show this help message
`);
		process.exit(0);
	} else {
		return { ...values, command: positionals[0] || "create" };
	}
}
