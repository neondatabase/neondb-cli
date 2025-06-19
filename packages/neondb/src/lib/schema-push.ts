import { neon } from "@neondatabase/serverless";
import { z } from "zod/v4";
import { reportZodIssues } from "./utils/format.js";
import { SchemaType, schemaSchema, tableSchema } from "./utils/table-schema.js";

type TableSchema = z.infer<typeof tableSchema>;
type SchemaSchema = z.infer<typeof schemaSchema>;

const getTablesFromSchema = (schema: SchemaSchema["schema"]) => {
	return schema.tables.map((table) => table);
};

const convertTableSchemaToSql = ({ columns }: TableSchema) => {
	return columns
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

	for (const table of tables) {
		const createQuery = `CREATE TABLE IF NOT EXISTS ${table.name}(${convertTableSchemaToSql(table)});`;
		await sql.query(createQuery);
	}
}
