import { createServerFn } from "@tanstack/react-start";
import { sql } from "./client";

export const getVersion = createServerFn().handler(async () => {
	const response = await sql`SELECT version()`;
	const { version } = response[0];
	return version;
});
