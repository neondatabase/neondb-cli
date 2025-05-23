import { z } from "zod/v4";
import { neonColumnTypeStrings } from "../neon-schema.js";

const columnSchema = z.object({
	name: z.string(),
	type: neonColumnTypeStrings,
	nonNullable: z.boolean().optional().catch(false),
	primary: z.boolean().optional().catch(false),
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

export type SchemaType = z.infer<typeof schemaSchema>;
