---
"neondb": patch
---

Fix `--seed` CLI flag

A bug was causing the `-s` flag to be ignored and the `--seed` to throw an exception (because the CLI expected `--sql` instead).
