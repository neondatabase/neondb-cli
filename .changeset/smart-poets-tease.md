---
"neondb": minor
---

Adds validation to user input on file name and environment variable key.

| Option     | Default        | Description               | Validation            |
| ---------- | -------------- | ------------------------- | --------------------- |
| dotEnvFile | ".env"         | Path to env file          | letters and `.`       |
| dotEnvKey  | "DATABASE_URL" | Environment variable name | `SCREAMING_SNAKE_CASE |
