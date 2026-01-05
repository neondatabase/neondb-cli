import { existsSync } from "node:fs";
import { log } from "@clack/prompts";
import { execa } from "execa";
import type { Editor } from "./types.js";

// The Neon Local Connect extension ID
const NEON_EXTENSION_ID = "databricks.neon-local-connect";

/**
 * Uses macOS mdfind to locate an app by bundle identifier
 */
async function findAppWithMdfind(bundleId: string): Promise<string | null> {
	try {
		const result = await execa(
			"mdfind",
			[`kMDItemCFBundleIdentifier == '${bundleId}'`],
			{ timeout: 5000 },
		);
		const paths = result.stdout.trim().split("\n").filter(Boolean);
		return paths[0] || null;
	} catch {
		return null;
	}
}

/**
 * Known installation paths for VS Code CLI
 */
function getVSCodePaths(): string[] {
	const platform = process.platform;
	const home = process.env.HOME || "";

	if (platform === "darwin") {
		return [
			"/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code",
			"/Applications/Visual Studio Code - Insiders.app/Contents/Resources/app/bin/code-insiders",
			`${home}/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code`,
			`${home}/Downloads/Visual Studio Code.app/Contents/Resources/app/bin/code`,
		];
	}

	if (platform === "linux") {
		return [
			"/usr/share/code/bin/code",
			"/usr/bin/code",
			"/snap/bin/code",
			"/usr/share/code-insiders/bin/code-insiders",
		];
	}

	if (platform === "win32") {
		const localAppData = process.env.LOCALAPPDATA || "";
		const programFiles = process.env.PROGRAMFILES || "C:\\Program Files";
		return [
			`${localAppData}\\Programs\\Microsoft VS Code\\bin\\code.cmd`,
			`${programFiles}\\Microsoft VS Code\\bin\\code.cmd`,
			`${localAppData}\\Programs\\Microsoft VS Code Insiders\\bin\\code-insiders.cmd`,
		];
	}

	return [];
}

/**
 * Known installation paths for Cursor CLI
 */
function getCursorPaths(): string[] {
	const platform = process.platform;
	const home = process.env.HOME || "";

	if (platform === "darwin") {
		return [
			"/Applications/Cursor.app/Contents/Resources/app/bin/cursor",
			`${home}/Applications/Cursor.app/Contents/Resources/app/bin/cursor`,
			`${home}/Downloads/Cursor.app/Contents/Resources/app/bin/cursor`,
		];
	}

	if (platform === "linux") {
		return [
			"/usr/share/cursor/bin/cursor",
			"/usr/bin/cursor",
			`${home}/.local/bin/cursor`,
			"/opt/cursor/bin/cursor",
		];
	}

	if (platform === "win32") {
		const localAppData = process.env.LOCALAPPDATA || "";
		const programFiles = process.env.PROGRAMFILES || "C:\\Program Files";
		return [
			`${localAppData}\\Programs\\Cursor\\resources\\app\\bin\\cursor.cmd`,
			`${localAppData}\\cursor\\Cursor.exe`,
			`${programFiles}\\Cursor\\resources\\app\\bin\\cursor.cmd`,
		];
	}

	return [];
}

/**
 * Finds the CLI command for an editor by checking known installation paths
 * On macOS, also uses mdfind to locate the app if standard paths fail
 * Falls back to the simple command name if no full path is found (in case it's in PATH)
 */
async function findEditorCommand(editor: Editor): Promise<string | null> {
	let paths: string[];
	let fallbackCommand: string;
	let bundleId: string | null = null;

	if (editor === "VS Code") {
		paths = getVSCodePaths();
		fallbackCommand = "code";
		bundleId = "com.microsoft.VSCode";
	} else if (editor === "Cursor") {
		paths = getCursorPaths();
		fallbackCommand = "cursor";
		bundleId = "com.todesktop.230313mzl4w4u92";
	} else {
		return null;
	}

	// Check each known path
	for (const path of paths) {
		if (existsSync(path)) {
			return path;
		}
	}

	// On macOS, try mdfind to locate the app dynamically
	if (process.platform === "darwin" && bundleId) {
		const appPath = await findAppWithMdfind(bundleId);
		if (appPath) {
			const cliPath = `${appPath}/Contents/Resources/app/bin/${fallbackCommand}`;
			if (existsSync(cliPath)) {
				return cliPath;
			}
		}
	}

	// Fall back to simple command name (relies on PATH)
	return fallbackCommand;
}

/**
 * Gets the URI scheme for an editor
 */
function getEditorUriScheme(editor: Editor): string | null {
	if (editor === "VS Code") {
		return "vscode";
	}
	if (editor === "Cursor") {
		return "cursor";
	}
	return null;
}

/**
 * Checks if the Neon extension is already installed for an editor
 */
export async function isExtensionInstalled(editor: Editor): Promise<boolean> {
	const command = await findEditorCommand(editor);
	if (!command) {
		return false;
	}

	try {
		const result = await execa(command, ["--list-extensions"], {
			timeout: 10000,
		});

		const extensions = result.stdout.toLowerCase().split("\n");
		return extensions.some((ext) =>
			ext.includes(NEON_EXTENSION_ID.toLowerCase()),
		);
	} catch {
		return false;
	}
}

/**
 * Options for installing the extension
 */
export interface InstallExtensionOptions {
	/** Path to a local .vsix file for testing */
	vsixPath?: string;
}

/**
 * Installs the Neon Local Connect extension for VS Code or Cursor
 * @param editor - The editor to install the extension for
 * @param options - Optional settings for installation
 */
export async function installExtension(
	editor: Editor,
	options?: InstallExtensionOptions,
): Promise<boolean> {
	const command = await findEditorCommand(editor);
	if (!command) {
		log.error(`Cannot find ${editor} installation`);
		return false;
	}

	// Determine what to install: local vsix file or marketplace extension
	const extensionSource = options?.vsixPath || NEON_EXTENSION_ID;
	const isLocalInstall = Boolean(options?.vsixPath);

	if (isLocalInstall) {
		log.info(`Installing from local file: ${options?.vsixPath}`);
	}

	try {
		const args = ["--install-extension", extensionSource, "--force"];

		// Only add --pre-release for marketplace installs
		if (!isLocalInstall) {
			args.push("--pre-release");
		}

		await execa(command, args, {
			timeout: 60000, // 60 second timeout for extension installation
			stdio: "inherit", // Show progress to user
		});

		return true;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";

		// Check if it's a command not found error
		if (errorMessage.includes("ENOENT")) {
			log.error(`Could not find ${editor} CLI.`);
			log.info(`Please ensure ${editor} is installed correctly.`);
		} else {
			log.error(
				`Failed to install Neon extension for ${editor}: ${errorMessage}`,
			);
		}
		return false;
	}
}

/**
 * Configures the Neon Local Connect extension with the API key
 * Uses the extension's URI handler to trigger the import-api-key command
 */
export async function configureExtension(
	editor: Editor,
	apiKey: string,
): Promise<boolean> {
	const scheme = getEditorUriScheme(editor);
	if (!scheme) {
		log.error(`Cannot configure extension for ${editor}`);
		return false;
	}

	// Build the URI to trigger the extension's import-api-key handler
	// Format: vscode://databricks.neon-local-connect/import-api-key?token=xxx
	const encodedApiKey = encodeURIComponent(apiKey);
	const uri = `${scheme}://${NEON_EXTENSION_ID}/import-api-key?token=${encodedApiKey}`;

	try {
		const platform = process.platform;

		if (platform === "darwin") {
			// macOS: use 'open' command
			await execa("open", [uri], { timeout: 10000 });
		} else if (platform === "linux") {
			// Linux: use 'xdg-open' command
			await execa("xdg-open", [uri], { timeout: 10000 });
		} else if (platform === "win32") {
			// Windows: use 'start' command
			await execa("cmd", ["/c", "start", "", uri], { timeout: 10000 });
		} else {
			log.warn(`Unsupported platform for URI opening: ${platform}`);
			return false;
		}

		return true;
	} catch (error) {
		log.error(
			`Failed to configure extension for ${editor}: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
		return false;
	}
}

/**
 * Returns the editor types that should use extension installation (vs MCP)
 */
export function usesExtension(editor: Editor): boolean {
	return editor === "VS Code" || editor === "Cursor";
}
