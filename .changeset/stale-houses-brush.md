---
"@neondatabase/vite-plugin-postgres": patch
---

Make sure the `postgresPlugin` runs first

adds `enforce:pre` to plugin configuration so it runs before everything.
It's important to run first so the development server plugin does not grab the `.env` before we change it.
