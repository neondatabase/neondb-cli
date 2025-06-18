import { DEFAULTS } from "./utils/args.js";

export const INTRO_ART = `


    ▟████████████▙
    ██          ██
    ██    ▗▅▖   ██       neon.com
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
	welcome: "Welcome! Let's get you set with a Postgres database on Neon. \n",
	generating: "Generating your database... ",
	envKeyExistsExit:
		"Please try again or select a different key for your connection string.",
	connectionString: (s: string) => `Connection string: ${s}`,
	poolerString: (s: string) => `Pooler string: ${s}`,
	botCheck: (
		url: string,
	) => `A tab will open in your browser just to check your're not a bot.
Paste the link below in your browser if it doesn't open automatically:
${url}

`,
	envSuccess: (dotEnvFile: string, dotEnvKey: string) =>
		`Saved it to ${dotEnvFile} as ${dotEnvKey} \n\n\n`,
	happyCoding: "Happy coding! 🚀",
	databaseGenerated: (url: string) => `Claim your Database at: ${url}`,
	questions: {
		dotEnvFilePath: `Enter the path to your environment file (default: ${DEFAULTS.dotEnvPath})`,
		dotEnvKey: `Enter the key for the database connection string (default: ${DEFAULTS.dotEnvKey})`,
	},

	info: {
		dotEnvFileNotFound: "No .env file found, creating one.",
		userCancelled: "Prompt cancelled by user.",
		defaultEnvKey: (dotEnvKey: string) =>
			`using ${dotEnvKey} as the environment variable key`,
		defaultEnvFilePath: (dotEnvPath: string) =>
			`using ${dotEnvPath} as the .env file`,
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
	},
} as const;
