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
import { installMCPServer } from "./lib/install.js";
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
	const availableEditors = detectAvailableEditors(homeDir);

	// If no editors detected, offer to continue anyway
	if (availableEditors.length === 0) {
		log.warn("No supported editors detected on your system.");
		log.info("Supported editors:");
		log.info("  • VS Code (with GitHub Copilot)");
		log.info("  • Cursor");

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
		options: ["Cursor", "VS Code"].map((editor) => ({
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
	const results = await installMCPServer(
		homeDir,
		workspaceDir,
		selectedEditors,
	);

	const successful: Editor[] = [];
	const failed: Editor[] = [];

	for (const [editor, status] of results.entries()) {
		if (status === "success") {
			successful.push(editor);
		} else {
			failed.push(editor);
		}
	}
	const successList = successful.join(" / ");
	if (successful.length > 0) {
		log.step("Installed Neon MCP server");
		log.step(`Success! Neon is now ready to use with ${successList}.\n`);
	}

	if (failed.length > 0) {
		log.error(`Failed to configure: ${failed.join(" / ")}`);
	}

	// Exit with error if all failed
	if (successful.length === 0) {
		outro(
			"Installation cancelled or failed. Please check the output above and try again.",
		);
		process.exit(1);
	}

	note(
		`\x1b[0mRestart ${successList} and type in "${bold(cyan("Get started with Neon using MCP resource"))}\x1b[0m" in the chat`,
		"What's next?",
	);

	outro("Have feedback? Email us at feedback@neon.tech");
}
