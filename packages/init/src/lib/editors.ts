import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Editor } from "./types.js";

/**
 * Gets VS Code's global config directory based on the platform
 */
export function getVSCodeGlobalConfigDir(homeDir: string): string | null {
	const platform = process.platform;

	if (platform === "darwin") {
		// macOS: ~/Library/Application Support/Code/User
		return resolve(
			homeDir,
			"Library",
			"Application Support",
			"Code",
			"User",
		);
	}
	if (platform === "linux") {
		// Linux: ~/.config/Code/User
		return resolve(homeDir, ".config", "Code", "User");
	}
	if (platform === "win32") {
		// Windows: %APPDATA%\Code\User
		const appData = process.env.APPDATA;
		if (appData) {
			return resolve(appData, "Code", "User");
		}
	}

	return null;
}

/**
 * Detects which editors are installed on the system
 */
export function detectAvailableEditors(homeDir: string): Editor[] {
	const editors: Editor[] = [];

	// Check for Cursor (global config directory)
	const cursorDir = resolve(homeDir, ".cursor");
	if (existsSync(cursorDir)) {
		editors.push("Cursor");
	}

	// Check if VS Code's global config directory exists
	const vscodeGlobalDir = getVSCodeGlobalConfigDir(homeDir);
	if (vscodeGlobalDir && existsSync(vscodeGlobalDir)) {
		editors.push("VS Code");
	}

	return editors;
}
