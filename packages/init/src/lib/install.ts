import { confirm, isCancel, log, spinner } from "@clack/prompts";
import { createApiKeyFromNeonctl, ensureNeonctlAuth } from "./auth.js";
import { getMCPConfig, writeMCPConfig } from "./mcp-config.js";
import type { Editor, InstallStatus } from "./types.js";

/**
 * Installs Neon's MCP Server for a specific editor
 * - Cursor: Global config
 * - VS Code: Global config (preferred) or workspace config (fallback)
 * - Claude CLI: Global config
 */
async function installMCPServerForEditor(
	homeDir: string,
	workspaceDir: string,
	editor: Editor,
	apiKey: string,
): Promise<InstallStatus> {
	const { config, configPath } = getMCPConfig(homeDir, workspaceDir, editor);

	// Check if already configured
	const serverKey = editor === "VS Code" ? config.servers : config.mcpServers;
	const alreadyConfigured = Boolean(serverKey?.Neon);

	if (alreadyConfigured) {
		const response = await confirm({
			message: `Neon MCP Server is already configured for ${editor}. Would you like to reconfigure it? (Y/n)`,
			initialValue: true,
		});

		if (isCancel(response)) {
			return "failed";
		}

		const shouldReconfigure = response as boolean;

		if (!shouldReconfigure) {
			log.info(`Keeping existing configuration for ${editor}.`);
			return "success";
		}
	}

	// Configure Neon MCP Server
	// Using remote MCP server with API key authentication
	// Ref: https://neon.com/docs/ai/neon-mcp-server#api-key-based-authentication
	const neonServerConfig = {
		type: "http",
		url: "https://mcp.neon.tech/mcp",
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
	};

	// VS Code uses "servers" key, Cursor and Claude CLI use "mcpServers" key
	if (editor === "VS Code") {
		if (!config.servers) {
			config.servers = {};
		}
		config.servers.Neon = neonServerConfig;
	} else {
		if (!config.mcpServers) {
			config.mcpServers = {};
		}
		config.mcpServers.Neon = neonServerConfig;
	}

	// Write configuration
	try {
		writeMCPConfig(configPath, config);
		return "success";
	} catch (error) {
		log.error(
			`Failed to write configuration for ${editor}: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
		return "failed";
	}
}

/**
 * Installs Neon's MCP Server
 * - Cursor: Global config
 * - VS Code: Global config (preferred) or workspace config (fallback)
 * - Claude CLI: Global config
 */
export async function installMCPServer(
	homeDir: string,
	workspaceDir: string,
	selectedEditors: Editor[],
): Promise<Map<Editor, InstallStatus>> {
	const results = new Map<Editor, InstallStatus>();

	// Ensure authentication (will trigger OAuth if needed)
	const authSpinner = spinner();
	authSpinner.start("Authenticating...");

	const authSuccess = await ensureNeonctlAuth();

	if (!authSuccess) {
		authSpinner.stop("Authentication failed");
		// Mark all editors as failed due to auth failure
		for (const editor of selectedEditors) {
			results.set(editor, "failed");
		}
		return results;
	}

	authSpinner.stop("Authentication successful ✓");

	// Create API key using the OAuth token
	const apiKey = await createApiKeyFromNeonctl();

	if (!apiKey) {
		log.error("Could not create API key after authentication.");
		log.info(
			"You can manually create one at: https://console.neon.tech/app/settings/api-keys",
		);
		// Mark all editors as failed due to API key creation failure
		for (const editor of selectedEditors) {
			results.set(editor, "failed");
		}
		return results;
	}

	// Install MCP server for each selected editor
	for (const editor of selectedEditors) {
		const status = await installMCPServerForEditor(
			homeDir,
			workspaceDir,
			editor,
			apiKey,
		);
		results.set(editor, status);
	}

	return results;
}
