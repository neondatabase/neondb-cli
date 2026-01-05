import { confirm, isCancel, log, spinner } from "@clack/prompts";
import { createApiKeyFromNeonctl, ensureNeonctlAuth } from "./auth.js";
import {
	configureExtension,
	type InstallExtensionOptions,
	installExtension,
	isExtensionInstalled,
	usesExtension,
} from "./extension.js";
import { getMCPConfig, writeMCPConfig } from "./mcp-config.js";
import type { Editor, InstallStatus } from "./types.js";

/**
 * Options for installing Neon
 */
export interface InstallNeonOptions {
	/** Path to a local .vsix file for testing extension installation */
	vsixPath?: string;
}

/**
 * Checks if an editor needs configuration for MCP (Claude CLI only)
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
			log.info(`Keeping existing configuration for ${editor}.`);
			return false;
		}
	}

	return true;
}

/**
 * Checks if an editor needs the extension installed (Cursor/VS Code)
 * Returns true if installation is needed, false otherwise
 */
async function shouldInstallExtension(editor: Editor): Promise<boolean> {
	const alreadyInstalled = await isExtensionInstalled(editor);

	if (alreadyInstalled) {
		const response = await confirm({
			message: `Neon Local Connect extension is already installed for ${editor}. Would you like to reinstall it? (Y/n)`,
			initialValue: false,
		});

		if (isCancel(response)) {
			return false;
		}

		const shouldReinstall = response as boolean;

		if (!shouldReinstall) {
			log.info(`Keeping existing extension for ${editor}.`);
			return false;
		}
	}

	return true;
}

/**
 * Installs Neon's MCP Server for Claude CLI
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
 * Installs Neon's Local Connect extension for VS Code/Cursor
 * or MCP Server for Claude CLI
 */
export async function installNeon(
	homeDir: string,
	workspaceDir: string,
	selectedEditors: Editor[],
	options?: InstallNeonOptions,
): Promise<Map<Editor, InstallStatus>> {
	const results = new Map<Editor, InstallStatus>();

	// Separate editors into extension-based (Cursor/VS Code) and MCP-based (Claude CLI)
	const extensionEditors = selectedEditors.filter(usesExtension);
	const mcpEditors = selectedEditors.filter((e) => !usesExtension(e));

	// Check which editors need configuration/installation
	const editorsToConfigureMap = new Map<Editor, boolean>();

	// Check extension-based editors
	for (const editor of extensionEditors) {
		const needsInstall = await shouldInstallExtension(editor);
		editorsToConfigureMap.set(editor, needsInstall);

		if (!needsInstall) {
			results.set(editor, "success");
		}
	}

	// Check MCP-based editors
	for (const editor of mcpEditors) {
		const needsConfig = await shouldConfigureMCP(
			homeDir,
			workspaceDir,
			editor,
		);
		editorsToConfigureMap.set(editor, needsConfig);

		if (!needsConfig) {
			results.set(editor, "success");
		}
	}

	// Get lists of editors that need work
	const extensionsToConfigure = extensionEditors.filter(
		(editor) => editorsToConfigureMap.get(editor) === true,
	);
	const mcpToConfigure = mcpEditors.filter(
		(editor) => editorsToConfigureMap.get(editor) === true,
	);

	// If nothing needs configuration, return early
	if (extensionsToConfigure.length === 0 && mcpToConfigure.length === 0) {
		log.info("All selected editors are already configured.");
		return results;
	}

	// Authenticate (needed for both extension and MCP setups)
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

	// Prepare extension install options
	const extensionOptions: InstallExtensionOptions = {
		vsixPath: options?.vsixPath,
	};

	// Install and configure extension for Cursor/VS Code
	if (extensionsToConfigure.length > 0) {
		// Install extension for each editor
		for (const editor of extensionsToConfigure) {
			const installSpinner = spinner();
			const installSource = options?.vsixPath
				? "local .vsix file"
				: "marketplace";
			installSpinner.start(
				`Installing Neon extension for ${editor} (from ${installSource})...`,
			);

			const installSuccess = await installExtension(
				editor,
				extensionOptions,
			);

			if (!installSuccess) {
				installSpinner.stop(
					`Failed to install extension for ${editor}`,
				);
				results.set(editor, "failed");
				continue;
			}

			installSpinner.stop(`Neon extension installed for ${editor} ✓`);

			// Wait for the extension to initialize before configuring
			const waitSpinner = spinner();
			waitSpinner.start(
				`Waiting for extension to initialize in ${editor}...`,
			);
			await new Promise((resolve) => setTimeout(resolve, 3000));
			waitSpinner.stop(`Extension initialized ✓`);

			// Explain to user what's about to happen
			log.info(
				`${editor} will ask permission to import your API key. Click "Open" to continue.`,
			);

			// Configure the extension with the API key using the extension's command
			const configSpinner = spinner();
			configSpinner.start(`Configuring Neon extension for ${editor}...`);

			const configSuccess = await configureExtension(editor, apiKey);

			if (configSuccess) {
				configSpinner.stop(`Neon extension configured for ${editor} ✓`);
				log.info(
					`Click the Neon icon in ${editor}'s sidebar to get started.`,
				);
			} else {
				configSpinner.stop(
					`Failed to configure extension for ${editor}`,
				);
				log.warn(
					`Please run the "Neon: Import API Key" command manually in ${editor}.`,
				);
			}

			results.set(editor, "success");
		}
	}

	// Install MCP server for Claude CLI
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

// Keep the old export name for backwards compatibility
export const installMCPServer = installNeon;
