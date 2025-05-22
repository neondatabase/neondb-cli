import { log } from "@clack/prompts";
import { neon } from "@neondatabase/serverless";
import { z } from "zod/v4";
import { schemaSchema, tableSchema } from "./utils/table-schema.js";

const getTablesFromSchema = (
	schema: z.infer<typeof schemaSchema>["schema"],
) => {
	return schema.tables.map((table) => table);
};

const convertTableSchemaToSql = (schema: z.infer<typeof tableSchema>) => {
	return schema.columns
		.map(
			(column) =>
				`${column.name} ${column.type}${
					column.nonNullable ? " NOT NULL" : ""
				}`,
		)
		.join(", ");
};

export async function pushTableSchema(
	schema: z.infer<typeof schemaSchema>["schema"],
	connectionString: string,
) {
	const { success, data } = schemaSchema.safeParse(schema);
	if (!success) {
		log.error("Invalid table schema");
		return;
	}

	const tables = getTablesFromSchema(
		data?.schema as z.infer<typeof schemaSchema>["schema"],
	);

	const sql = neon(connectionString);

	tables.forEach(async (table) => {
		const createQuery = `CREATE TABLE IF NOT EXISTS ${table.name}(
            ${convertTableSchemaToSql(table)}
);`;

		await sql.query(createQuery);
	});
}
