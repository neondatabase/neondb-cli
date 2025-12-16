import { confirm, isCancel, log, spinner } from "@clack/prompts";
import { createApiKeyFromNeonctl, ensureNeonctlAuth } from "./auth.js";
import { getMCPConfig, writeMCPConfig } from "./mcp-config.js";
import type { Editor, InstallStatus } from "./types.js";

/**
 * Checks if an editor needs configuration (either not configured or user wants to reconfigure)
 * Returns true if configuration is needed, false otherwise
 */
async function shouldConfigureEditor(
	homeDir: string,
	workspaceDir: string,
	editor: Editor,
): Promise<boolean> {
	const { config } = getMCPConfig(homeDir, workspaceDir, editor);

	// Check if already configured
	const serverKey = editor === "VS Code" ? config.servers : config.mcpServers;
	const alreadyConfigured = Boolean(serverKey?.Neon);

	if (alreadyConfigured) {
		const response = await confirm({
			message: `Neon MCP Server is already configured for ${editor}. Would you like to reconfigure it? (Y/n)`,
			initialValue: true,
		});

		if (isCancel(response)) {
			return false;
		}

		const shouldReconfigure = response as boolean;

		if (!shouldReconfigure) {
			log.info(`Keeping existing configuration for ${editor}.`);
			return false;
		}
	}

	return true;
}

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

	const editorsToConfigureMap = new Map<Editor, boolean>();
	for (const editor of selectedEditors) {
		const needsConfig = await shouldConfigureEditor(
			homeDir,
			workspaceDir,
			editor,
		);
		editorsToConfigureMap.set(editor, needsConfig);

		// If editor doesn't need configuration, mark as success
		if (!needsConfig) {
			results.set(editor, "success");
		}
	}

	// Get list of editors that need configuration
	const editorsToConfigure = selectedEditors.filter(
		(editor) => editorsToConfigureMap.get(editor) === true,
	);

	// If no editors need configuration, return early
	if (editorsToConfigure.length === 0) {
		log.info("All selected editors are already configured.");
		return results;
	}

	const authSpinner = spinner();
	authSpinner.start("Authenticating...");

	const authSuccess = await ensureNeonctlAuth();

	if (!authSuccess) {
		authSpinner.stop("Authentication failed");
		// Mark all editors that need configuration as failed
		for (const editor of editorsToConfigure) {
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
		// Mark all editors that need configuration as failed
		for (const editor of editorsToConfigure) {
			results.set(editor, "failed");
		}
		return results;
	}

	// Install MCP server for editors that need configuration
	for (const editor of editorsToConfigure) {
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
