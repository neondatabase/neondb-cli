import { bgBlack, bold, greenBright } from "yoctocolors";
import { DEFAULTS } from "./utils/args.js";

export const INTRO_ART = `


    ▟████████████▙
    ██          ██
    ██    ▗▅▖   ██       https://neon.com
    ██    ████▙ ██       ├── /docs
    ██    ██ ▜████       └── /discord
    ██    ██   ▜█▛
    ▜██████▛


`;

export const messages = {
	/**
	 * these messages must be short and concise
	 * exceeding 2 lines trigger a rendering issue
	 * in @clack/prompts
	 *
	 * @see https://github.com/bombshell-dev/clack/issues/132
	 */
	welcome: `Let's get you set with a Postgres database on ${bgBlack(greenBright(bold(" Neon ")))}.`,
	nonInteractive: "`get-db --yes` for non-interactive flow with defaults.",
	generating: "Generating your database... ",
	envKeyExistsExit:
		"Please try again or select a different key for your connection string.",
	happyCoding: "Happy coding! 🚀",
	questions: {
		dotEnvFilePath: `Enter the path to your environment file (default: ${DEFAULTS.dotEnvPath})`,
		dotEnvKey: `Enter the key for the database connection string (default: ${DEFAULTS.dotEnvKey})`,
		seedPath: `Enter the path to your seed (.sql) file (default: ${
			DEFAULTS.seed?.path || "none"
		})`,
		prefix: `Enter the prefix for public environment variables (default: ${DEFAULTS.envPrefix})`,
	},
	info: {
		dotEnvFileNotFound: "No .env file found, creating one.",
		userCancelled: "Prompt cancelled by user.",
		defaultEnvKey: (dotEnvKey: string) =>
			`using ${dotEnvKey} as the environment variable key`,
		defaultEnvFilePath: (dotEnvPath: string) =>
			`using ${dotEnvPath} as the .env file`,
		defaultPrefix: (prefix: string) =>
			`using ${prefix} as the prefix for public environment variables`,
	},

	errors: {
		invalidEnvFile: "Invalid .env file format \n",
		envKeyExists: (dotEnvKey: string, dotEnvFile: string) =>
			`${dotEnvKey} already exists in ${dotEnvFile}`,
		failedToParseEnvFile: "Failed to parse .env file",
		failedToWriteEnvFile: "Failed to write .env file",
		failedToGenerateDatabase: "Failed to generate database",
		failedToOpenBrowser: "Failed to open browser",
		failedToCreateClaimableDatabase: "Failed to create claimable database",
		failedToCreatePoolerString: "Failed to create pooler string",
		failedToSaveConnectionString: "Failed to save connection string",
		failedToSavePoolerString: "Failed to save pooler string",
		failedToSaveEnvFile: "Failed to save .env file",
		referrerIsRequired: {
			message: "referrer parameter is required",
			description:
				"The referrer helps track usage for the Instagres Affiliates Program",
			hint: "instantPostgres({ referrer: 'your-app-name' })",
			docs: "For more information, visit: https://neon.com/docs/reference/instagres",
		},
	},
} as const;
