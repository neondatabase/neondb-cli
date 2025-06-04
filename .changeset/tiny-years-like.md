---
"neondb": patch
---

Fix: prevent flags from being ignored

This release fixes a regression where `--env` and `--key` flags were being ignored and defaults would be used regardless.
