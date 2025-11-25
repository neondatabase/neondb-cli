---
"get-db": minor
"neondb": minor
"vite-plugin-db": minor
"@neondatabase/vite-plugin-postgres": minor
---

**Make pooler the default connection**

this change may be perceived as breaking change for some, but it aligns to best practices for Neon databases.

In prior releases, we wrote the following 3 variables to the env file:

| Variable                     | Description                      |
| ---------------------------- | -------------------------------- |
| `DATABASE_URL`               | the **direct** connection string |
| `DATABASE_URL_POOLER`        | the pooler connection string     |
| `PUBLIC_INSTAGRES_CLAIM_URL` | the url to be claimed            |

From this release onwards, we're aligning on using the **pooler connection string as the default**.

| Variable                     | Description                      |
| ---------------------------- | -------------------------------- |
| `DATABASE_URL`               | the **pooler** connection string |
| `DATABASE_URL_DIRECT`        | the direct connection string     |
| `PUBLIC_INSTAGRES_CLAIM_URL` | the url to be claimed            |
