import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
	confirm,
	intro,
	isCancel,
	log,
	note,
	outro,
	spinner,
} from "@clack/prompts";
import { execa } from "execa";
import { bold, cyan } from "yoctocolors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MCPConfig {
	mcpServers: {
		[key: string]: {
			url: string;
			headers?: Record<string, string>;
		};
	};
}

/**
 * Ensures neonctl is authenticated by running a command that triggers auth if needed
 * This will automatically start the OAuth flow if the user isn't already authenticated
 */
async function ensureNeonctlAuth(): Promise<boolean> {
	try {
		// Use execa to authenticate with neonctl
		await execa("npx", ["-y", "neonctl", "me", "--no-analytics"], {
			stdio: "inherit", // Shows OAuth URL and prompts to the user
		});

		return true;
	} catch (error) {
		log.error(
			`Authentication failed: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
		return false;
	}
}

/**
 * Gets the OAuth access token from neonctl's stored credentials
 */
async function getNeonctlAccessToken(): Promise<string | null> {
	try {
		const homeDir = process.env.HOME || process.env.USERPROFILE;
		if (!homeDir) return null;

		const credentialsPath = resolve(
			homeDir,
			".config",
			"neonctl",
			"credentials.json",
		);
		if (!existsSync(credentialsPath)) return null;

		const credentials = JSON.parse(readFileSync(credentialsPath, "utf-8"));
		return credentials.access_token || null;
	} catch {
		return null;
	}
}

/**
 * Creates an API key using the Neon API with the OAuth token from neonctl
 */
async function createApiKeyFromNeonctl(): Promise<string | null> {
	try {
		const accessToken = await getNeonctlAccessToken();
		if (!accessToken) {
			log.error("Could not find OAuth token from neonctl");
			return null;
		}

		// Generate a unique key name with timestamp
		const timestamp = new Date()
			.toISOString()
			.replace(/[:.]/g, "-")
			.slice(0, -5); // e.g., 2024-10-08T15-30-45
		const keyName = `neonctl-init-${timestamp}`;

		// Call Neon API to create an API key
		const response = await fetch(
			"https://console.neon.tech/api/v2/api_keys",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					key_name: keyName,
				}),
			},
		);

		if (!response.ok) {
			const errorText = await response.text();
			log.error(
				`Failed to create API key: ${response.status} ${errorText}`,
			);
			return null;
		}

		const data = await response.json();
		return data.key || null;
	} catch (error) {
		log.error(
			`Failed to create API key: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
		return null;
	}
}

/**
 * Gets or creates the .cursor/mcp.json configuration
 */
function getMCPConfig(cursorDir: string): MCPConfig {
	const mcpConfigPath = resolve(cursorDir, "mcp.json");

	if (existsSync(mcpConfigPath)) {
		try {
			const content = readFileSync(mcpConfigPath, "utf-8");
			return JSON.parse(content);
		} catch (_error) {
			log.warn(
				"Failed to parse existing mcp.json. Creating a new configuration.",
			);
			return { mcpServers: {} };
		}
	}

	return { mcpServers: {} };
}

/**
 * Writes the MCP configuration to .cursor/mcp.json
 */
function writeMCPConfig(cursorDir: string, config: MCPConfig): void {
	const mcpConfigPath = resolve(cursorDir, "mcp.json");

	if (!existsSync(cursorDir)) {
		mkdirSync(cursorDir, { recursive: true });
	}

	writeFileSync(mcpConfigPath, JSON.stringify(config, null, 2), "utf-8");
}

/**
 * Installs Neon's MCP Server by configuring it globally in ~/.cursor/mcp.json
 */
async function installMCPServer(): Promise<boolean> {
	const homeDir = process.env.HOME || process.env.USERPROFILE;
	if (!homeDir) {
		log.error("Could not determine home directory");
		return false;
	}
	const cursorDir = resolve(homeDir, ".cursor");
	const config = getMCPConfig(cursorDir);

	// Check if already configured
	const alreadyConfigured = Boolean(config.mcpServers.Neon);
	let shouldReconfigure = false;

	if (alreadyConfigured) {
		const response = await confirm({
			message:
				"Neon MCP Server is already configured. Would you like to reconfigure it? (Y/n)",
			initialValue: true,
		});

		if (isCancel(response)) {
			return false;
		}

		shouldReconfigure = response as boolean;

		if (!shouldReconfigure) {
			log.info("Keeping existing global configuration.");
			return true;
		}
	}

	// Ensure authentication (will trigger OAuth if needed)
	const authSpinner = spinner();
	authSpinner.start("Authenticating...");

	const authSuccess = await ensureNeonctlAuth();

	if (!authSuccess) {
		authSpinner.stop("Authentication failed");
		return false;
	}

	authSpinner.stop("Authentication successful ✓");

	// Create API key using the OAuth token
	const apiKey = await createApiKeyFromNeonctl();

	if (!apiKey) {
		log.error("Could not create API key after authentication.");
		log.info(
			"You can manually create one at: https://console.neon.tech/app/settings/api-keys",
		);
		return false;
	}

	// Configure Neon MCP Server
	// Using remote MCP server with API key authentication
	// Ref: https://neon.com/docs/ai/neon-mcp-server#api-key-based-authentication
	config.mcpServers.Neon = {
		url: "https://mcp.neon.tech/mcp",
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
	};

	// Write configuration
	try {
		writeMCPConfig(cursorDir, config);
		return true;
	} catch (error) {
		log.error(
			`Failed to write global configuration: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
		return false;
	}
}

/**
 * Initialize Neon projects with MCP Server
 */
export async function init(): Promise<void> {
	intro("Adding Neon to your project");

	// Check if Cursor is installed
	const homeDir = process.env.HOME || process.env.USERPROFILE;
	if (!homeDir) {
		log.error("Could not determine home directory");
		process.exit(1);
	}

	const cursorDir = resolve(homeDir, ".cursor");
	if (!existsSync(cursorDir)) {
		log.warn("Cursor not found.");
		log.warn(
			"Error: Cursor is required to continue. Support for additional agents is coming soon.",
		);
		outro("📣 Is this unexpected? Email us at feedback@neon.tech");
		process.exit(1);
	}

	const mcpSuccess = await installMCPServer();

	if (!mcpSuccess) {
		outro(
			"Initialization cancelled or failed. Please check the output above and try again.",
		);
		process.exit(1);
	}

	log.step("Installed Neon MCP server");
	log.step("Success! Neon is now ready to use with Cursor.\n");

	// \x1b[0m is the ANSI escape code for "reset all styles" to clear any dimming/fading that clack's note() applies
	note(
		`\x1b[0mAsk Cursor to "${bold(cyan("Get started with Neon using MCP Resource"))}\x1b[0m" in the chat`,
		"What's next?",
	);

	outro("Have feedback? Email us at feedback@neon.tech");
}
