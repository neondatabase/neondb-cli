import { exec } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { intro, isCancel, log, outro, select, spinner } from "@clack/prompts";

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface MCPConfig {
	mcpServers: {
		[key: string]: {
			command: string;
			args: string[];
			env?: Record<string, string>;
		};
	};
}

interface NeonOrganization {
	id: string;
	name: string;
}

/**
 * Ensures neonctl is authenticated by running a command that triggers auth if needed
 * This will automatically start the OAuth flow if the user isn't already authenticated
 */
async function ensureNeonctlAuth(): Promise<boolean> {
	try {
		// Use spawn to show OAuth URL if authentication is needed
		const { spawn } = await import("node:child_process");

		await new Promise<void>((resolve, reject) => {
			const meProcess = spawn(
				"npx",
				["-y", "neonctl", "me", "--output", "json", "--no-analytics"],
				{
					stdio: "inherit", // Shows OAuth URL and prompts to the user
					shell: true, // Run through cmd.exe on Windows for proper npm command resolution
				},
			);

			meProcess.on("close", (code) => {
				if (code === 0) {
					resolve();
				} else {
					reject(
						new Error(
							`Authentication failed with exit code ${code}`,
						),
					);
				}
			});

			meProcess.on("error", reject);
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

async function fetchOrganizations(): Promise<NeonOrganization[]> {
	try {
		const { stdout } = await execAsync(
			"npx -y neonctl orgs list --output json --no-analytics",
			{ maxBuffer: 1024 * 1024 },
		);

		const data = JSON.parse(stdout);

		// The neon CLI returns an array of organizations
		const organizations: NeonOrganization[] = Array.isArray(data)
			? data.map((org: { id: string; name?: string }) => ({
					id: org.id,
					name: org.name || org.id,
				}))
			: [];

		return organizations;
	} catch (error) {
		log.warn(
			`Unable to fetch organizations: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
		return [];
	}
}

/**
 * Gets or creates the MCP configuration for a given platform
 */
function getMCPConfig(configDir: string, filename: string): MCPConfig {
	const mcpConfigPath = resolve(configDir, filename);

	if (existsSync(mcpConfigPath)) {
		try {
			const content = readFileSync(mcpConfigPath, "utf-8");
			return JSON.parse(content);
		} catch (_error) {
			log.warn(
				`Failed to parse existing ${filename}. Creating a new configuration.`,
			);
			return { mcpServers: {} };
		}
	}

	return { mcpServers: {} };
}

/**
 * Writes the MCP configuration to the specified config file
 */
function writeMCPConfig(
	configDir: string,
	config: MCPConfig,
	filename: string,
): void {
	const mcpConfigPath = resolve(configDir, filename);

	if (!existsSync(configDir)) {
		mkdirSync(configDir, { recursive: true });
	}

	writeFileSync(mcpConfigPath, JSON.stringify(config, null, 2), "utf-8");
}

/**
 * Gets the AGENTS.md template with Neon-specific best practices
 */
function getAgentsMdTemplate(): string {
	const templatePath = resolve(__dirname, "../src/agents-template.md");
	return readFileSync(templatePath, "utf-8");
}

/**
 * Generates the organization configuration section for AGENTS.md
 */
function getOrgConfigSection(orgId: string): string {
	return `## Neon Project Configuration

> **🔴 IMPORTANT: You MUST use this organization for all Neon operations in this project.**

**Organization ID:** \`${orgId}\`

When using any Neon MCP tools or API calls, always pass this \`org_id\` parameter. The MCP server is pre-configured with this organization.

**Example:**
- When listing projects: Use \`mcp_Neon_list_projects\` with \`org_id: "${orgId}"\`
- When creating resources: Always include \`org_id: "${orgId}"\` in your tool calls

---

`;
}

/**
 * Creates or updates AGENTS.md with Neon-specific best practices
 */
async function createAgentsMd(orgId?: string): Promise<boolean> {
	const agentsPath = resolve(process.cwd(), "AGENTS.md");

	try {
		// Check if AGENTS.md already exists
		if (existsSync(agentsPath)) {
			// Append to existing file
			const existingContent = readFileSync(agentsPath, "utf-8");

			// Check if Neon section already exists to avoid duplicates
			if (existingContent.includes("## Neon Database Guidelines")) {
				log.info("Neon guidelines already exist in AGENTS.md");
				return true;
			}

			const separator = "\n\n---\n\n";
			let content = "";

			// Add org ID context if provided
			if (orgId) {
				content += getOrgConfigSection(orgId);
			}

			content += getAgentsMdTemplate();

			const updatedContent = existingContent + separator + content;
			writeFileSync(agentsPath, updatedContent, "utf-8");
			log.success(
				`Appended Neon best practices to existing AGENTS.md at ${agentsPath}`,
			);
		} else {
			// Create new file with proper header
			let content = "";

			// Add org ID context if provided
			if (orgId) {
				content += getOrgConfigSection(orgId);
			}

			content += getAgentsMdTemplate();

			const newContent = `# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this project.

---

${content}`;
			writeFileSync(agentsPath, newContent, "utf-8");
			log.success(
				`Created AGENTS.md with Neon best practices at ${agentsPath}`,
			);
		}
		return true;
	} catch (error) {
		log.error(
			`Failed to create/update AGENTS.md: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
		return false;
	}
}

type Platform = "cursor" | "claude-code" | "both";

/**
 * Gets the appropriate config directory and file path for Cursor
 */
function getCursorConfig(homeDir: string) {
	return {
		dir: resolve(homeDir, ".cursor"),
		file: "mcp.json",
	};
}

/**
 * Checks if the claude CLI is available
 */
async function isClaudeCLIAvailable(): Promise<boolean> {
	try {
		await execAsync("claude --version");
		return true;
	} catch {
		return false;
	}
}

/**
 * Adds Neon MCP Server using the claude CLI
 */
async function addMCPServerViaCLI(apiKey: string): Promise<boolean> {
	try {
		// Remove existing server if it exists
		try {
			await execAsync("claude mcp remove Neon");
		} catch {
			// Ignore if server doesn't exist
		}

		// Add the Neon MCP server
		const command = `claude mcp add Neon npx -- -y @neondatabase/mcp-server-neon start ${apiKey}`;
		await execAsync(command);
		return true;
	} catch (error) {
		log.error(
			`Failed to add MCP server via claude CLI: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
		return false;
	}
}

/**
 * Installs Neon's MCP Server by configuring it globally
 * Returns the selected organization ID if one was chosen
 */
async function installMCPServer(platform: Platform = "cursor"): Promise<{
	success: boolean;
	orgId?: string;
}> {
	const homeDir = process.env.HOME || process.env.USERPROFILE;
	if (!homeDir) {
		log.error("Could not determine home directory");
		return { success: false };
	}

	// Check if claude CLI is available for claude-code or both platforms
	if (platform === "claude-code" || platform === "both") {
		const claudeCLIAvailable = await isClaudeCLIAvailable();
		if (!claudeCLIAvailable) {
			log.error("Claude CLI is not available.");
			log.info(
				"Please install it from: https://docs.anthropic.com/en/docs/claude-code",
			);
			return { success: false };
		}
	}

	const platformName =
		platform === "both"
			? "Cursor and Claude Code"
			: platform === "cursor"
				? "Cursor"
				: "Claude Code";

	// Step 1: Ensure authentication (will trigger OAuth if needed)
	log.step("Authenticating with Neon...");
	log.info("The authentication URL will be displayed below if needed.");
	log.info("");

	const authSpinner = spinner();
	authSpinner.start("Waiting for authentication...");

	const authSuccess = await ensureNeonctlAuth();

	if (!authSuccess) {
		authSpinner.stop("Authentication failed");
		return { success: false };
	}

	authSpinner.stop("Authentication successful ✓");

	// Step 2: Fetch organizations and let user select
	let selectedOrgId: string | undefined;

	const orgSpinner = spinner();
	orgSpinner.start("Fetching your organizations...");
	const organizations = await fetchOrganizations();
	orgSpinner.stop(
		`Found ${organizations.length} organization${organizations.length !== 1 ? "s" : ""}`,
	);

	if (organizations.length > 1) {
		const orgChoice = await select({
			message: "Select an organization for this project:",
			options: organizations.map((org) => ({
				value: org.id,
				label: org.name,
			})),
		});

		if (isCancel(orgChoice)) {
			return { success: false };
		}

		selectedOrgId = orgChoice.toString();
		const selectedOrg = organizations.find(
			(org) => org.id === selectedOrgId,
		);
		log.success(`Selected organization: ${selectedOrg?.name}`);
	} else if (organizations.length === 1) {
		// Only one org, auto-select it
		selectedOrgId = organizations[0].id;
		log.info(`Using organization: ${organizations[0].name}`);
	} else {
		// No organizations found (personal account)
		log.info("Using personal account");
	}

	// Step 3: Create API key using the OAuth token
	const s = spinner();
	s.start("Creating API key...");
	const apiKey = await createApiKeyFromNeonctl();
	s.stop(
		apiKey ? "API key created successfully ✓" : "Failed to create API key",
	);

	if (!apiKey) {
		log.error("Could not create API key after authentication.");
		log.info(
			"You can manually create one at: https://console.neon.tech/app/settings/api-keys",
		);
		return { success: false };
	}

	// Step 4: Configure Neon MCP Server for each platform
	const configSpinner = spinner();
	configSpinner.start(`Configuring ${platformName}...`);

	try {
		// Configure Cursor
		if (platform === "cursor" || platform === "both") {
			const cursorConfig = getCursorConfig(homeDir);
			const config = getMCPConfig(cursorConfig.dir, cursorConfig.file);

			// Use npx.cmd on Windows for better compatibility
			const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

			config.mcpServers.Neon = {
				command: "npx",
				args: ["-y", "@neondatabase/mcp-server-neon", "start", apiKey],
			};

			writeMCPConfig(cursorConfig.dir, config, cursorConfig.file);
			log.success(
				`Neon MCP Server configured for Cursor at ${resolve(cursorConfig.dir, cursorConfig.file)}`,
			);
		}

		// Configure Claude Code using CLI
		if (platform === "claude-code" || platform === "both") {
			const cliSuccess = await addMCPServerViaCLI(apiKey);
			if (!cliSuccess) {
				configSpinner.stop("Failed to configure Claude Code");
				return { success: false };
			}
			log.success("Neon MCP Server configured for Claude Code");
		}

		configSpinner.stop("Configuration complete ✓");
		log.info("This configuration will be available in all your projects.");
		return { success: true, orgId: selectedOrgId };
	} catch (error) {
		configSpinner.stop("Configuration failed");
		log.error(
			`Failed to write configuration: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
		return { success: false };
	}
}

/**
 * Initialize Neon projects with MCP Server and AI assistant rules
 */
export async function init(): Promise<void> {
	intro("🚀 Neon Project Initialization");

	log.info(
		"This will set up your project with Neon's MCP Server and AI coding best practices.",
	);

	// Ask user which platform they want to configure
	const platformChoice = await select({
		message: "Which AI coding assistant(s) would you like to configure?",
		options: [
			{ value: "cursor", label: "Cursor" },
			{
				value: "claude-code",
				label: "Claude Code (requires claude CLI)",
			},
			{ value: "both", label: "Both Cursor and Claude Code" },
		],
		initialValue: "cursor",
	});

	if (isCancel(platformChoice)) {
		outro("❌ Initialization cancelled.");
		process.exit(1);
	}

	const selectedPlatform = platformChoice as Platform;

	log.step("Step 1/2: Configuring Neon MCP Server");
	const { success: mcpSuccess, orgId } =
		await installMCPServer(selectedPlatform);

	if (!mcpSuccess) {
		outro("❌ Initialization cancelled or failed.");
		process.exit(1);
	}

	log.step("Step 2/2: Creating AGENTS.md with Neon best practices");
	const agentsSuccess = await createAgentsMd(orgId);

	if (!agentsSuccess) {
		log.warn("Failed to create AGENTS.md, but MCP Server is configured.");
	}

	outro("Success! Neon project initialized.");
	console.log("");
	console.log(
		"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
	);
	console.log("");
	console.log("Next steps:");
	console.log("");

	const assistantName =
		selectedPlatform === "both"
			? "Cursor or Claude Code"
			: selectedPlatform === "cursor"
				? "Cursor"
				: "Claude Code";

	console.log(`    1. Restart ${assistantName}`);
	console.log("");
	console.log("    2. Type this in your AI chat to begin:");
	console.log("");
	console.log("       ┌──────────────────────────────────────┐");
	console.log("       │                                      │");
	console.log("       │    Get started with Neon             │");
	console.log("       │                                      │");
	console.log("       └──────────────────────────────────────┘");
	console.log("");
	console.log(
		"Your AI assistant now has access to Neon best practices via AGENTS.md",
	);
	console.log("");
	console.log(
		"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
	);
}
