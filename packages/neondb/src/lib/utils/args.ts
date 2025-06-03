import { parseArgs } from "node:util";
import { type Defaults } from "../types.js";

export const DEFAULTS: Defaults = {
	dotEnvPath: "./.env",
	dotEnvKey: "DATABASE_URL",
};

export function getArgs() {
	const { values } = parseArgs({
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
			help: {
				type: "boolean",
				short: "h",
			},
		},
	});

	if (values.help) {
		console.log(`
Usage: neondb [options]

Options:
  -y, --yes       Skip all prompts and use defaults
  -e, --env       Path to the .env file (default: "${DEFAULTS.dotEnvPath}") 
  -k, --key       Key for the database connection string (default: "${DEFAULTS.dotEnvKey}")
  -h, --help      Show this help message
`);
		process.exit(0);
	} else {
		return values;
	}
}
