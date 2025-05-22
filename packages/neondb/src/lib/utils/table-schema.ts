import { z } from "zod/v4";
import { neonColumnTypeStrings } from "../neon-schema.js";

const columnSchema = z.object({
	name: z.string(),
	type: neonColumnTypeStrings,
	nonNullable: z.boolean().default(false),
});

export const tableSchema = z.object({
	name: z.string(),
	columns: z.array(columnSchema),
});

export const schemaSchema = z.object({
	schema: z.object({
		tables: z.array(tableSchema),
	}),
});
