import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

export async function seedDatabase(
	schemaFilePath: string,
	connectionString: string,
) {
	const client = neon(connectionString);
	const schema = await readFile(schemaFilePath, "utf8");

	const commands = schema
		.split(";")
		.map((cmd) => cmd.trim())
		.filter(Boolean);

	for (const command of commands) {
		await client.query(command);
	}
}
