import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { getVSCodeGlobalConfigDir } from "./editors.js";
import type { Editor, MCPConfig } from "./types.js";

/**
 * Gets or creates the MCP configuration for a specific editor
 * - Cursor: Global config at ~/.cursor/mcp.json
 * - VS Code: Try global config first, then workspace
 */
export function getMCPConfig(
	homeDir: string,
	workspaceDir: string,
	editor: Editor,
): { config: MCPConfig; configPath: string } {
	let editorDir: string;

	if (editor === "VS Code") {
		// Try global config first
		const vscodeGlobalDir = getVSCodeGlobalConfigDir(homeDir);
		if (vscodeGlobalDir && existsSync(vscodeGlobalDir)) {
			editorDir = vscodeGlobalDir;
		} else {
			// Fall back to workspace
			editorDir = resolve(workspaceDir, ".vscode");
		}
	} else {
		// Cursor always uses global config
		editorDir = resolve(homeDir, ".cursor");
	}

	const mcpConfigPath = resolve(editorDir, "mcp.json");

	if (existsSync(mcpConfigPath)) {
		try {
			const content = readFileSync(mcpConfigPath, "utf-8");
			return {
				config: JSON.parse(content),
				configPath: mcpConfigPath,
			};
		} catch (_error) {
			return {
				config:
					editor === "VS Code" ? { servers: {} } : { mcpServers: {} },
				configPath: mcpConfigPath,
			};
		}
	}

	return {
		config: editor === "VS Code" ? { servers: {} } : { mcpServers: {} },
		configPath: mcpConfigPath,
	};
}

/**
 * Writes the MCP configuration to the appropriate location
 * - Cursor: Global config at ~/.cursor/mcp.json
 * - VS Code: Global config (preferred) or workspace config (fallback)
 */
export function writeMCPConfig(configPath: string, config: MCPConfig): void {
	const editorDir = dirname(configPath);

	if (!existsSync(editorDir)) {
		mkdirSync(editorDir, { recursive: true });
	}

	writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}
