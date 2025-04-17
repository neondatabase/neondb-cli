import { parseArgs } from "node:util";
import { type Defaults } from "../types.js";

export const DEFAULTS: Defaults = {
	dotEnvPath: "./.env",
	dotEnvKey: "DATABASE_URL",
	referrer: "neondb-cli",
	provider: "aws",
	region: "eu-central-1",
};

export function getArgs() {
	const { values } = parseArgs({
		options: {
			yes: {
				type: "boolean",
				short: "y",
				default: false,
			},
			referrer: {
				type: "string",
				short: "r",
			},
			provider: {
				type: "string",
				short: "p",
			},
			region: {
				type: "string",
				short: "r",
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
  -r, --referrer  Referrer for the database (default: "${DEFAULTS.referrer}")
  -e, --env       Path to the .env file (default: "${DEFAULTS.dotEnvPath}") 
  -k, --key       Key for the database connection string (default: "${DEFAULTS.dotEnvKey}")
  -p, --provider  Provider for the database (default: "${DEFAULTS.provider}")
  -r, --region    Region for the database (default: "${DEFAULTS.region}")
  -h, --help      Show this help message
`);
		process.exit(0);
	} else {
		return values;
	}
}
