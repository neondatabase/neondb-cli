---
"neondb": minor
---

Add support for seeding a SQL script during database initialization. You can now provide a path to a SQL file that will be executed right after the database is created. Either via the prompt or with a command flag.

| Option       | Description                                         |
| ------------ | --------------------------------------------------- |
| `-s, --seed` | Path to SQL file to execute after database creation |
