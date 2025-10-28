---
"neon-init": patch
---

Improve agents template with better guidance for .env handling and database driver setup:

-   Add explicit safeguards to prevent accidental .env file overwrites when files are in ignore lists
-   Require LLMs to read .env before modifying it and use append commands when files are unreadable
-   Update established project guidance to automatically integrate installed drivers with existing code
-   Clean up output during authentication flow based on user feedback
