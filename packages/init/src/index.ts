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
import { execa } from "execa";

const execAsync = promisify(exec);

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
		// Use execa to authenticate with neonctl
		await execa(
			"npx",
			["-y", "neonctl", "me", "--output", "json", "--no-analytics"],
			{
				stdio: "inherit", // Shows OAuth URL and prompts to the user
			},
		);

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
		} else {
			// Create new file with proper header
			const newContent = `# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this project.

---

${neonReference}`;
			writeFileSync(agentsPath, newContent, "utf-8");
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
		const response = await confirm({
			message:
				"Neon MCP Server is already configured. Would you like to reconfigure it? (suggested)?",
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

	// Ensure authentication (will trigger OAuth if needed)
	const authSpinner = spinner();
	authSpinner.start("Authenticating...");

	const authSuccess = await ensureNeonctlAuth();

	if (!authSuccess) {
		authSpinner.stop("Authentication failed");
		return { success: false };
	}

	authSpinner.stop("Authentication successful ✓");

	// Fetch organizations and let user select
	let selectedOrgId: string | undefined;

	const organizations = await fetchOrganizations();

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

	// Create API key using the OAuth token
	const apiKey = await createApiKeyFromNeonctl();

	if (!apiKey) {
		log.error("Could not create API key after authentication.");
		log.info(
			"You can manually create one at: https://console.neon.tech/app/settings/api-keys",
		);
		return { success: false };
	}

	// Step 4: Configure Neon MCP Server
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
		log.info("");
		outro("📣 Is this unexpected? Email us at feedback@neon.tech");
		process.exit(1);
	}

	const { success: mcpSuccess, orgId } = await installMCPServer();

	if (!mcpSuccess) {
		outro("Initialization cancelled or failed.");
		process.exit(1);
	} else {
		log.info("Installed Neon MCP server");
	}

	const neonMdSuccess = await createNeonMd(orgId);

	if (!neonMdSuccess) {
		log.warn("Failed to create neon.md, but MCP Server is configured.");
	}

	const agentsSuccess = await createAgentsMd();

	if (!agentsSuccess) {
		log.warn("Failed to create AGENTS.md, but MCP Server is configured.");
	} else {
		log.step("Added Neon instructions to AGENTS.md");
	}

	outro("Success! Neon is now ready to use with Cursor.");
	log.info("");
	log.info("📣 Have feedback? Email us at feedback@neon.tech");
	log.info("");
	log.info("");
	log.info('Next Steps: Ask Cursor to "Get started with Neon" in the chat');
}
