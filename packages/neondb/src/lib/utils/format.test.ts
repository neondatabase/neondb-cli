import { describe, expect, test } from "vitest";
import { getPoolerString } from "./format.js";

describe("getPoolerString", () => {
	test("returns the pooler string", () => {
		expect(
			getPoolerString(
				"postgres://user:password@host:port/database.us-east-1.aws.neon.tech",
			),
		).toMatch(
			"postgres://user:password@host:port/database-pooler.us-east-1.aws.neon.tech",
		);
	});
});
