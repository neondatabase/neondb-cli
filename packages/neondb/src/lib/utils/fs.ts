import {
	closeSync,
	existsSync,
	mkdirSync,
	openSync,
	readFileSync,
	writeSync,
} from "node:fs";
import { dirname } from "node:path";
import { log, outro } from "@clack/prompts";
import { parse } from "dotenv";
import { messages } from "../texts.js";

function validateSql(sql: string) {
	const openParens = (sql.match(/\(/g) || []).length;
	const closeParens = (sql.match(/\)/g) || []).length;
	if (openParens !== closeParens) {
		throw new Error("SQL has unbalanced parentheses");
	}

	return true;
}

export function readSql(path: string) {
	try {
		return validateSql(readFileSync(path, "utf8"));
	} catch (error) {
		log.error(
			error instanceof Error ? error.message : "Failed to read SQL file.",
		);
		process.exit(1);
	}
}

export function getDotEnvContent(dotEnvFile: string): Record<string, string> {
	if (!existsSync(dotEnvFile)) {
		log.info(messages.info.dotEnvFileNotFound);
		return {};
	}

	try {
		const content = readFileSync(dotEnvFile);
		return parse(content);
	} catch {
		throw new Error(messages.errors.failedToParseEnvFile);
	}
}

export function prepEnv(dotEnvFile: string, dotEnvKey: string) {
	try {
		const dotEnvContent = getDotEnvContent(dotEnvFile);

		if (dotEnvContent[dotEnvKey]) {
			log.warn(messages.errors.envKeyExists(dotEnvKey, dotEnvFile));
			outro(messages.envKeyExistsExit);
			process.exit(0);
		}
		return;
	} catch (error) {
		// getDotEnvContent will create empty file if it doesn't exist
		// or throw if parsing fails
		if (
			error instanceof Error &&
			error.message === messages.errors.failedToParseEnvFile
		) {
			console.error(error);
			log.error(messages.errors.invalidEnvFile);

			process.exit(1);
		}
	}
}

export async function writeToEnv(
	dotEnvFile: string,
	dotEnvKey: string,
	claimExpiresAt: Date,
	claimUrl: URL,
	connString: string,
	poolerString: string,
) {
	if (!existsSync(dirname(dotEnvFile))) {
		mkdirSync(dirname(dotEnvFile), { recursive: true });
	}

	const openedFile = openSync(dotEnvFile, "a");
	writeSync(
		openedFile,
		`# Claimable DB expires at: ${claimExpiresAt.toUTCString()}
# Claim it now to your account: ${claimUrl.href}
${dotEnvKey}=${connString}
${dotEnvKey}_POOLER=${poolerString}
`,
	);
	closeSync(openedFile);
}
