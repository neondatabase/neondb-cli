import {
	confirm,
	intro,
	isCancel,
	log,
	multiselect,
	note,
	outro,
} from "@clack/prompts";
import { bold, cyan } from "yoctocolors";
import { detectAvailableEditors } from "./lib/editors.js";
import { installMCPServer, installNeonLocalConnect } from "./lib/install.js";
import type { Editor } from "./lib/types.js";

/**
 * Initialize Neon projects with MCP Server
 */
export async function init(): Promise<void> {
	intro("Adding Neon to your project");

	// Get the home directory
	const homeDir = process.env.HOME || process.env.USERPROFILE;
	if (!homeDir) {
		log.error("Could not determine home directory");
		outro("📣 Is this unexpected? Email us at feedback@neon.tech");
		process.exit(1);
	}

	// Get the current workspace directory
	const workspaceDir = process.cwd();

	// Detect available editors
	const availableEditors = await detectAvailableEditors(homeDir);

	// If no editors detected, offer to continue anyway
	if (availableEditors.length === 0) {
		log.warn("No supported editors detected on your system.");
		log.info("Supported editors:");
		log.info("  • VS Code (with GitHub Copilot)");
		log.info("  • Cursor");
		log.info("  • Claude CLI");

		const continueAnyway = await confirm({
			message:
				"Would you like to configure MCP anyway? (You can manually select your editor)",
			initialValue: true,
		});

		if (isCancel(continueAnyway) || !continueAnyway) {
			outro("Installation cancelled");
			process.exit(0);
		}
	}

	// Determine which editors to configure
	const response = await multiselect({
		message:
			"Which editor(s) would you like to configure? (Space to toggle each option, Enter to confirm your selection)",
		options: ["Cursor", "VS Code", "Claude CLI"].map((editor) => ({
			value: editor,
			label: editor,
		})),
		initialValues: availableEditors, // Select detected editors by default
		required: true,
	});

	if (isCancel(response)) {
		outro("Installation cancelled");
		process.exit(0);
	}

	const selectedEditors = response as Editor[];

	if (selectedEditors.length === 0) {
		log.warn("No editors selected.");
		outro("Installation cancelled");
		process.exit(0);
	}

	// Install MCP server for selected editors
	const mcpResults = await installMCPServer(
		homeDir,
		workspaceDir,
		selectedEditors,
	);

	const mcpSuccessful: Editor[] = [];
	const mcpFailed: Editor[] = [];

	for (const [editor, status] of mcpResults.entries()) {
		if (status === "success") {
			mcpSuccessful.push(editor);
		} else {
			mcpFailed.push(editor);
		}
	}

	const mcpSuccessList = mcpSuccessful.join(" / ");
	if (mcpSuccessful.length > 0) {
		log.step(
			`Success! Neon MCP Server is now ready to use with ${mcpSuccessList}.\n`,
		);
	}

	if (mcpFailed.length > 0) {
		log.error(
			`Failed to configure MCP Server for ${mcpFailed.join(" / ")}`,
		);
	}

	// Install Neon Local Connect extension for VS Code and Cursor
	const extensionResults = await installNeonLocalConnect(selectedEditors);

	const extSuccessful: Editor[] = [];
	const extFailed: Editor[] = [];

	for (const [editor, status] of extensionResults.entries()) {
		if (status === "success") {
			extSuccessful.push(editor);
		} else {
			extFailed.push(editor);
		}
	}

	if (extSuccessful.length > 0) {
		const extSuccessList = extSuccessful.join(" / ");
		log.step(
			`Neon Local Connect extension installed for ${extSuccessList}.\n`,
		);
	}

	// Show helpful installation links for failed extension installations
	if (extFailed.length > 0) {
		log.info(
			"For the best local development experience, install Neon Local Connect:",
		);
		for (const editor of extFailed) {
			if (editor === "VS Code") {
				log.info(
					"  • VS Code: https://marketplace.visualstudio.com/items?itemName=databricks.neon-local-connect",
				);
			} else if (editor === "Cursor") {
				log.info(
					"  • Cursor: https://open-vsx.org/extension/databricks/neon-local-connect",
				);
			}
		}
	}

	// Exit with error if all failed
	if (mcpSuccessful.length === 0 && extSuccessful.length === 0) {
		outro(
			"Installation cancelled or failed. Please check the output above and try again.",
		);
		process.exit(1);
	}

	note(
		`\x1b[0mRestart ${mcpSuccessList} and type in "${bold(cyan("Get started with Neon"))}\x1b[0m" in the chat`,
		"What's next?",
	);

	outro("Have feedback? Email us at feedback@neon.tech");
}
