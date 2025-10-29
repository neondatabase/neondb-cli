---
"get-db": patch
"neondb": patch
---

**Add URL detection to `claim` command**

`get-db claim` command was unable to detect URLs for custom env_var prefixes.
Now it accepts an override via the feature-flag, but it will also try to automatically detect the URL if it can't find the default prefix easily.
