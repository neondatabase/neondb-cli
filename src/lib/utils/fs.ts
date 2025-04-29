import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { appendFile } from "node:fs/promises";
import { dirname } from "node:path";
import { outro } from "@clack/prompts";
import { log } from "@clack/prompts";
import { parse } from "dotenv";
import { messages } from "../texts.js";

export function readOrCreate(path: string): string {
	try {
		return readFileSync(path, "utf8");
	} catch {
		mkdirSync(dirname(path), { recursive: true });
		writeFileSync(path, "");
		return "";
	}
}

export function getDotEnvContent(dotEnvFile: string): Record<string, string> {
	const content = readOrCreate(dotEnvFile);

	try {
		return parse(content);
	} catch {
		throw new Error(messages.errors.failedToParseEnvFile);
	}
}

export function writeFile(path: string, content: string): void {
	try {
		void writeFileSync(path, content);
	} catch {
		mkdirSync(dirname(path), { recursive: true });
		void writeFileSync(path, "");
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
	} catch (error) {
		// getDotEnvContent will create empty file if it doesn't exist
		// or throw if parsing fails
		if (
			error instanceof Error &&
			error.message === messages.errors.failedToParseEnvFile
		) {
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
	await appendFile(
		dotEnvFile,
		`

# Claimable DB expires at: ${claimExpiresAt.toUTCString()}
# Claim it now to your account: ${claimUrl.href}
${dotEnvKey}=${connString}
${dotEnvKey}_POOLER=${poolerString}
`,
	);
}
