export type Editor = "Cursor" | "VS Code";

export type InstallStatus = "success" | "failed";

export interface MCPConfig {
	mcpServers?: {
		[key: string]: {
			type?: string;
			url: string;
			headers?: Record<string, string>;
		};
	};
	servers?: {
		[key: string]: {
			type?: string;
			url: string;
			headers?: Record<string, string>;
		};
	};
}
