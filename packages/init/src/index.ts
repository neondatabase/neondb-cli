import { exec } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import {
	confirm,
	intro,
	isCancel,
	log,
	outro,
	select,
	spinner,
} from "@clack/prompts";

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
 * Gets the neon.md template with Neon-specific best practices
 */
function getNeonMdTemplate(): string {
	const templatePath = resolve(__dirname, "../src/agents-template.md");
	return readFileSync(templatePath, "utf-8");
}

/**
 * Generates the organization configuration section for neon.md
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
 * Gets the reference text to add to AGENTS.md
 */
function getAgentsNeonReference(): string {
	return `## Working with Neon Database

When the user asks to **"Get started with Neon"** or something similar, refer to the detailed guidelines in \`neon.md\`.`;
}

/**
 * Creates or updates neon.md with detailed Neon guidelines
 */
async function createNeonMd(orgId?: string): Promise<boolean> {
	const neonMdPath = resolve(process.cwd(), "neon.md");

	try {
		// Check if neon.md already exists
		if (existsSync(neonMdPath)) {
			log.info("neon.md already exists");
			const response = await confirm({
				message:
					"Replace existing neon.md with updated guidelines? (suggested)",
				initialValue: true,
			});

			if (isCancel(response)) {
				return false;
			}

			if (!response) {
				log.info("Keeping existing neon.md");
				return true;
			}
		}

		let content = "";

		// Add org ID context if provided
		if (orgId) {
			content += getOrgConfigSection(orgId);
		}

		content += getNeonMdTemplate();

		writeFileSync(neonMdPath, content, "utf-8");
		log.success(
			`Created neon.md with detailed guidelines at ${neonMdPath}`,
		);
		return true;
	} catch (error) {
		log.error(
			`Failed to create neon.md: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
		return false;
	}
}

/**
 * Creates or updates AGENTS.md with a reference to neon.md
 */
async function createAgentsMd(): Promise<boolean> {
	const agentsPath = resolve(process.cwd(), "AGENTS.md");

	try {
		const neonReference = getAgentsNeonReference();

		// Check if AGENTS.md already exists
		if (existsSync(agentsPath)) {
			// Append to existing file
			const existingContent = readFileSync(agentsPath, "utf-8");

			// Check if Neon section already exists to avoid duplicates
			if (existingContent.includes("## Working with Neon Database")) {
				log.info("Neon reference already exists in AGENTS.md");
				return true;
			}

			const separator = "\n\n---\n\n";
			const updatedContent = existingContent + separator + neonReference;
			writeFileSync(agentsPath, updatedContent, "utf-8");
			log.success(
				`Appended Neon reference to existing AGENTS.md at ${agentsPath}`,
			);
		} else {
			// Create new file with proper header
			const newContent = `# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this project.

---

${neonReference}`;
			writeFileSync(agentsPath, newContent, "utf-8");
			log.success(
				`Created AGENTS.md with Neon reference at ${agentsPath}`,
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

/**
 * Installs Neon's MCP Server by configuring it globally in ~/.cursor/mcp.json
 * Returns the selected organization ID if one was chosen
 */
async function installMCPServer(): Promise<{
	success: boolean;
	orgId?: string;
}> {
	const homeDir = process.env.HOME || process.env.USERPROFILE;
	if (!homeDir) {
		log.error("Could not determine home directory");
		return { success: false };
	}
	const cursorDir = resolve(homeDir, ".cursor");
	const config = getMCPConfig(cursorDir);

	// Check if already configured
	const alreadyConfigured = Boolean(config.mcpServers.Neon);
	let shouldReconfigure = false;

	if (alreadyConfigured) {
		log.info("Neon MCP Server is already configured globally");
		const response = await confirm({
			message: "Would you like to reconfigure it? (suggested)",
			initialValue: true,
		});

		if (isCancel(response)) {
			return { success: false };
		}

		shouldReconfigure = response as boolean;

		if (!shouldReconfigure) {
			log.info("Keeping existing global configuration.");
		}
	}

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

	// If user chose not to reconfigure, we're done (but we still return the org ID)
	if (alreadyConfigured && !shouldReconfigure) {
		return { success: true, orgId: selectedOrgId };
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

	// Step 4: Configure Neon MCP Server
	const args = ["-y", "@neondatabase/mcp-server-neon", "start", apiKey];

	config.mcpServers.Neon = {
		command: "npx",
		args,
	};

	// Write configuration
	try {
		writeMCPConfig(cursorDir, config);
		log.success(
			`Neon MCP Server configured globally at ${resolve(cursorDir, "mcp.json")}`,
		);
		log.info("This configuration will be available in all your projects.");
		return { success: true, orgId: selectedOrgId };
	} catch (error) {
		log.error(
			`Failed to write global configuration: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
		return { success: false };
	}
}

/**
 * Initialize Neon projects with MCP Server and AI assistant rules
 */
export async function init(): Promise<void> {
	intro("🚀 Neon Project Initialization");

	// Check if Cursor is installed
	const homeDir = process.env.HOME || process.env.USERPROFILE;
	if (!homeDir) {
		log.error("Could not determine home directory");
		process.exit(1);
	}

	const cursorDir = resolve(homeDir, ".cursor");
	if (!existsSync(cursorDir)) {
		log.warn("This tool currently only supports Cursor IDE.");
		log.info("We'd love to hear which IDE you're using!");
		log.info("");
		log.info("Please send your feedback to: init-feedback@neon.tech");
		log.info("");
		outro("❌ Cursor IDE is required to continue.");
		process.exit(1);
	}

	log.info(
		"This will set up your project with Neon's MCP Server and AI coding best practices.",
	);

	log.step("Step 1/3: Configuring Neon MCP Server...");
	const { success: mcpSuccess, orgId } = await installMCPServer();

	if (!mcpSuccess) {
		outro("❌ Initialization cancelled or failed.");
		process.exit(1);
	}

	log.step("Step 2/3: Creating neon.md with detailed guidelines...");
	const neonMdSuccess = await createNeonMd(orgId);

	if (!neonMdSuccess) {
		log.warn("Failed to create neon.md, but MCP Server is configured.");
	}

	log.step("Step 3/3: Creating AGENTS.md for Cursor...");
	const agentsSuccess = await createAgentsMd();

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
	console.log("    1. Restart Cursor");
	console.log("");
	console.log("    2. Type this in your Cursor chat to begin:");
	console.log("");
	console.log("       ┌──────────────────────────────────────┐");
	console.log("       │                                      │");
	console.log("       │    Get started with Neon             │");
	console.log("       │                                      │");
	console.log("       └──────────────────────────────────────┘");
	console.log("");
	console.log(
		"Your AI assistant now has access to Neon best practices via neon.md",
	);
	console.log("(referenced in AGENTS.md for easy discovery)");
	console.log("");
	console.log(
		"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
	);
}
