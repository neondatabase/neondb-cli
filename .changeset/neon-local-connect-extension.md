---
"neon-init": minor
---

Install Neon Local Connect extension for VS Code and Cursor instead of MCP Server.

-   VS Code and Cursor now use the Neon Local Connect extension for local database development
-   Claude CLI continues to use the MCP Server
-   Extension is automatically installed via CLI with robust path detection (checks known installation paths, uses mdfind on macOS)
-   API key is automatically configured via extension URI handler
-   Falls back to showing marketplace links if CLI installation fails
