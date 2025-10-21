---
"neondb": patch
"@neondatabase/vite-plugin-postgres": patch
---

Fix existing settings check.

-   Env preparation was wrongfully checking only for default variable and file name.
-   `--yes` flag was supressing other flags. Now it's possible to override promptless path.
