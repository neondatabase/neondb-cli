---
"neon-init": minor
---

**Agent guidelines now served via MCP resource**

Removed AGENTS.md and .neon/AGENTS.md file creation logic. Agent guidelines are now provided directly by the Neon MCP Server as an MCP resource, eliminating the need to create local files in user projects.

Changes:

-   Removed functions for creating AGENTS.md and .neon/AGENTS.md files
-   Removed organization fetching and selection (no longer needed for local files)
-   Simplified the CLI flow to only configure the MCP server
-   Updated README to reflect that guidelines are built into the MCP server
-   Reduced bundle size by ~19%

Users should now use "Get started with Neon using MCP Resource" to access the interactive onboarding flow.
