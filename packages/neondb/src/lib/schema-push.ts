import { neon } from "@neondatabase/serverless";
import { z } from "zod/v4";
import { reportZodIssues } from "./utils/format.js";
import { SchemaType, schemaSchema, tableSchema } from "./utils/table-schema.js";

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
				}${column.primary ? " PRIMARY KEY" : ""}`,
		)
		.join(", ");
};

export const validateSchema = (schema: SchemaType) => {
	const { success, data, error } = schemaSchema.safeParse(schema);

	if (!success) {
		reportZodIssues(error);
		process.exit(1);
	}

	return data;
};

export async function pushTableSchema(
	schema: SchemaType,
	connectionString: string,
) {
	const tables = getTablesFromSchema(schema.schema);

	const sql = neon(connectionString);

	tables.forEach(async (table) => {
		const createQuery = `CREATE TABLE IF NOT EXISTS ${table.name}(
            ${convertTableSchemaToSql(table)}
);`;

		await sql.query(createQuery);
	});
}
