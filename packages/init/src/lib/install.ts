import { confirm, isCancel, log, spinner } from "@clack/prompts";
import { createApiKeyFromNeonctl, ensureNeonctlAuth } from "./auth.js";
import {
	configureExtension,
	installExtension,
	usesExtension,
	waitForExtensionInstalled,
} from "./extension.js";
import { getMCPConfig, writeMCPConfig } from "./mcp-config.js";
import type { Editor, InstallStatus } from "./types.js";

/**
 * Checks if an editor needs MCP configuration
 * Returns true if configuration is needed, false otherwise
 */
async function shouldConfigureMCP(
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
			log.info(
				`Keeping existing MCP server configuration for ${editor}.`,
			);
			return false;
		}
	}

	return true;
}

/**
 * Installs Neon's MCP Server for specific editors
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

	// Claude CLI uses "mcpServers" key
	if (!config.mcpServers) {
		config.mcpServers = {};
	}
	config.mcpServers.Neon = neonServerConfig;

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
 * Installs Neon's Local Connect extension or MCP Server for specific editors
 */
export async function installNeon(
	homeDir: string,
	workspaceDir: string,
	selectedEditors: Editor[],
): Promise<Map<Editor, InstallStatus>> {
	const results = new Map<Editor, InstallStatus>();

	const extensionEditors = selectedEditors.filter(usesExtension);
	const mcpEditors = selectedEditors.filter((e) => !usesExtension(e));

	// Check which MCP editors need configuration
	const mcpEditorsToConfigureMap = new Map<Editor, boolean>();
	for (const editor of mcpEditors) {
		const needsConfig = await shouldConfigureMCP(
			homeDir,
			workspaceDir,
			editor,
		);
		mcpEditorsToConfigureMap.set(editor, needsConfig);

		if (!needsConfig) {
			results.set(editor, "success");
		}
	}

	const mcpToConfigure = mcpEditors.filter(
		(editor) => mcpEditorsToConfigureMap.get(editor) === true,
	);

	// Extension editors always get processed (silent installation)
	const extensionsToConfigure = extensionEditors;

	// If nothing needs configuration, return early
	if (extensionsToConfigure.length === 0 && mcpToConfigure.length === 0) {
		return results;
	}

	const authSpinner = spinner();
	authSpinner.start("Authenticating...");

	const authSuccess = await ensureNeonctlAuth();

	if (!authSuccess) {
		authSpinner.stop("Authentication failed");
		// Mark all editors that need configuration as failed
		for (const editor of [...extensionsToConfigure, ...mcpToConfigure]) {
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
		for (const editor of [...extensionsToConfigure, ...mcpToConfigure]) {
			results.set(editor, "failed");
		}
		return results;
	}

	// Install and configure extension for Cursor/VS Code (silently)
	for (const editor of extensionsToConfigure) {
		const installSuccess = await installExtension(editor);

		if (!installSuccess) {
			results.set(editor, "failed");
			continue;
		}

		const isReady = await waitForExtensionInstalled(editor);
		if (!isReady) {
			// Extension install command succeeded but extension didn't appear in list
			results.set(editor, "failed");
			continue;
		}

		// Configure the extension with the API key
		const configSuccess = await configureExtension(editor, apiKey);

		if (configSuccess) {
			results.set(editor, "success");
		} else {
			// Extension installed but auth failed but user can manually configure later
			results.set(editor, "success");
		}
	}

	for (const editor of mcpToConfigure) {
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
