## Neon Database Guidelines

> **Context:** These guidelines apply when working with Neon Postgres databases in this project.
>
> **When to use:** Code involving database connections, queries, schema management, or Neon-specific features.

This file provides guidance to AI coding assistants (Cursor, Windsurf, etc.) when working with Neon in this project.

---

## Communication Style

**Keep all responses succinct:**

-   ✅ Tell the user what you did: "Created users table with 3 columns"
-   ✅ Ask direct questions when needed: "Which database should I use?"
-   ❌ Avoid verbose explanations of what you're about to do
-   ❌ Don't explain every step unless the user asks

**Examples:**

-   **Good**: "Added DATABASE_URL to .env. Ready to connect?"
-   **Bad**: "I'm going to add the DATABASE_URL environment variable to your .env file so that your application can connect to the database. This will allow..."

---

## Get Started with Neon (Interactive Guide)

**TRIGGER PHRASE:** When the user says "Get started with Neon" or similar phrases, provide an interactive onboarding experience by following these steps:

**Before starting:** Let the user know they can pause and resume anytime by saying "Continue with Neon setup" if they need to come back later.

**RESUME TRIGGER:** If the user says "Continue with Neon setup" or similar, check what's already configured (MCP server, .env, dependencies, schema) and resume from where they left off. Ask them which step they'd like to continue from or analyze their setup to determine automatically.

### Step 1: Check Existing Neon Projects

Use the Neon MCP Server to check if the user has existing projects (remember to use the configured `org_id` if specified above). Then guide them based on what you find:

**If they have NO projects:**

-   Ask if they want to create a new project
-   Guide them to create one at console.neon.tech or help them do it via the MCP server

**If they have 1 project:**

-   Show them the project name and ask: "Would you like to use '{project_name}' or create a new one?"
-   If they choose existing project, proceed to Step 3
-   If they want to create new, guide them accordingly

**If they have multiple projects (less than 20):**

-   List all their projects with each name
-   Ask which one they want to work on, OR
-   Offer the option to create a new project
-   Confirm their selection before proceeding

**If they have many projects (20+):**

-   Tell them how many projects they have
-   Ask them to specify which project they want to use by name or ID
-   Or offer to help them create a new one

### Step 2: Database Setup

**Get the connection string:**

-   Use the MCP server to get the connection string for the selected project

**Configure it for their environment:**

-   Most projects use a `.env` file with `DATABASE_URL`
-   For other setups (deployed platforms, containers, cloud configs), check their project structure and ask where they store credentials

**Important:** If you cannot write to the file (permissions, file location, etc.), run the command to allow the user to add it themselves:

```bash
echo "DATABASE_URL=postgresql://..." >> .env
```

Or show them the exact line to add:

```
DATABASE_URL=postgresql://user:password@host/database
```

### Step 3: Install Dependencies

Check if the user already has a common driver installed. If not, based on their framework, environment and use case, recommend the appropriate driver and install it for the user. Keep the conversation focused.

**For Serverless/Edge (Vercel, Cloudflare Workers, etc.):**

```bash
npm install @neondatabase/serverless
```

**For Traditional Node.js:**

```bash
npm install pg
```

### Step 4: Understand the Project

**First, check if this is an empty/new project:**

-   Look for existing source code, routes, components, or substantial application logic
-   Check if it's just a bare package.json or minimal boilerplate

**If it's an empty or near-empty project:**

Ask the user briefly (1-2 questions):

-   What are they building? (e.g., "a blog", "an API for a mobile app", "a SaaS dashboard")
-   Any specific technologies they want to use? (e.g., "Next.js", "tRPC", "Express")

**If it's an established project:**

Skip the questions - you can infer what they're building from the existing codebase.

**Remember the context** (whether from questions or code analysis) for all subsequent MCP Server interactions and recommendations. However, stay focused on Neon setup - don't get sidetracked into other architectural discussions until setup is complete.

### Step 5: ORM Setup

**Check if they have an ORM:**

Look for ORM configuration files or imports (Prisma, Drizzle, TypeORM, etc.)

**If no ORM found:**

Ask: "Want to set up an ORM for type-safe database queries?"

**If yes, suggest based on their project:**

If they decline, proceed with raw SQL queries.

### Step 6: Schema Setup

**First, check for existing schema:**

Search the codebase for:

-   SQL migration files (`.sql`, `migrations/` folder)
-   ORM schemas (Prisma `schema.prisma`, Drizzle schema files, TypeORM entities)
-   Database initialization scripts

**If they have existing schema:**

-   Show them what you found
-   Ask: "Found existing schema definitions. Want to migrate these to your Neon database?"
-   If yes, help execute the migrations using the MCP server or guide them through their ORM's migration process

**If no existing schema found:**

Ask if they want to:

1. Create a simple example schema (users table)
2. Design a custom schema together
3. Skip schema setup for now

**If they choose (1):** Create a basic example users table using the MCP server:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**If they choose (2):** Ask them about their app's needs and help design tables. Then create the schema using the MCP server or guide them to create it via their ORM.

**If they choose (3):** Move on to Step 7. They can always come back to add schema later.

### Step 7: What's Next

Let them know you're ready to help with more:

"You're all set! Here are some things I can help with - feel free to ask about any of these (or anything else):

-   Neon-specific features (branching, autoscaling, scale-to-zero)
-   Connection pooling for production
-   Writing queries or building API endpoints
-   Database migrations and schema changes
-   Performance optimization"

### Important Notes:

-   Be succinct yet conversational and guide them step-by-step
-   Know the context of the user's codebase before each step
-   Provide working, tested code examples
-   Check for errors in their existing setup before proceeding
-   Don't give up - always at least give the user a way to complete the setup manually.

---

## Neon Database Best Practices

### Security

**Follow these security practices:**

1. Never commit connection strings to version control
2. Use environment variables for all database credentials
3. Prefer SSL connections (default in Neon)
4. Use least-privilege database roles for applications
5. Rotate API keys and passwords regularly

### Neon-Specific Features

**Leverage Neon's unique features:**

1. **Branching**: Create database branches for development/staging
2. **Autoscaling**: Neon automatically scales compute based on load
3. **Scale to Zero**: Databases automatically suspend after inactivity
4. **Point-in-Time Recovery**: Restore databases to any point in time

## Additional Resources

-   [Neon Documentation](https://neon.tech/docs)
-   [Neon Serverless Driver](https://neon.tech/docs/serverless/serverless-driver)
-   [Neon API Reference](https://api-docs.neon.tech/)
-   [Postgres Documentation](https://www.postgresql.org/docs/)

---
