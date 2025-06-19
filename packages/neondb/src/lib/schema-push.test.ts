import { NeonQueryFunction, neon } from "@neondatabase/serverless";
import { describe, expect, it, vi } from "vitest";
import { pushTableSchema, validateSchema } from "./schema-push.js";
import type { SchemaType } from "./utils/table-schema.js";

vi.mock("@neondatabase/serverless", () => ({
	neon: vi.fn(() => ({
		query: vi.fn(),
		unsafe: vi.fn(),
		transaction: vi.fn(),
	})),
}));

const validSchema = {
	schema: {
		tables: [
			{
				name: "users",
				columns: [
					{
						name: "id",
						type: "uuid",
						primary: true,
						nonNullable: true,
					},
				],
			},
		],
	},
} satisfies SchemaType;

const invalidSchema = {
	schema: {
		tables: [
			{
				name: "users",
				columns: [
					{
						invalid: true,
					},
				],
			},
		],
	},
};

describe("Validates schema and throws on invalid schema", () => {
	it("validates a correct schema", () => {
		expect(() => validateSchema(validSchema)).not.toThrow();
	});

	it("fails on invalid schema", () => {
		const mockExit = vi
			.spyOn(process, "exit")
			.mockImplementation(() => undefined as never);

		//@ts-expect-error - the schema is purposely invalid
		validateSchema(invalidSchema);
		expect(mockExit).toHaveBeenCalledWith(1);
		mockExit.mockRestore();
	});
});

describe("Create the appropriate SQL from the schema and calls Neon serverless driver to push it.", () => {
	it("creates tables from schema", async () => {
		const mockQuery = vi.fn();
		const mockUnsafe = vi.fn();
		const mockTransaction = vi.fn();

		vi.mocked(neon).mockReturnValue({
			query: mockQuery,
			unsafe: mockUnsafe,
			transaction: mockTransaction,
		} as unknown as NeonQueryFunction<boolean, boolean>);

		await pushTableSchema(validSchema, "mock-connection-string");

		expect(mockQuery).toHaveBeenCalledWith(
			"CREATE TABLE IF NOT EXISTS users(\n            id uuid NOT NULL PRIMARY KEY\n);",
		);
	});
});
