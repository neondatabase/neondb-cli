import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { getVSCodeGlobalConfigDir } from "./editors.js";
import type { Editor, MCPConfig } from "./types.js";

/**
 * Gets or creates the MCP configuration for a specific editor
 * - Cursor: Global config at ~/.cursor/mcp.json
 * - VS Code: Try global config first, then workspace
 * - Claude CLI: Global config at ~/.claude.json
 */
export function getMCPConfig(
	homeDir: string,
	workspaceDir: string,
	editor: Editor,
): { config: MCPConfig; configPath: string } {
	let mcpConfigPath: string;

	if (editor === "VS Code") {
		// Try global config first
		const vscodeGlobalDir = getVSCodeGlobalConfigDir(homeDir);
		if (vscodeGlobalDir && existsSync(vscodeGlobalDir)) {
			mcpConfigPath = resolve(vscodeGlobalDir, "mcp.json");
		} else {
			// Fall back to workspace
			mcpConfigPath = resolve(workspaceDir, ".vscode", "mcp.json");
		}
	} else if (editor === "Claude CLI") {
		// Claude CLI uses ~/.claude.json
		mcpConfigPath = resolve(homeDir, ".claude.json");
	} else {
		// Cursor uses ~/.cursor/mcp.json
		mcpConfigPath = resolve(homeDir, ".cursor", "mcp.json");
	}

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
 * - Claude CLI: Global config at ~/.claude.json
 */
export function writeMCPConfig(configPath: string, config: MCPConfig): void {
	const editorDir = dirname(configPath);

	if (!existsSync(editorDir)) {
		mkdirSync(editorDir, { recursive: true });
	}

	writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
}
