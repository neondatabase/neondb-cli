import { z } from "zod/v4";

export const neonColumnTypeStrings = z.union([
	z.literal("numeric"),
	z.literal("decimal"),
	z.literal("integer"),
	z.literal("bigint"),
	z.literal("smallint"),
	z.literal("real"),
	z.literal("double"),
	z.literal("serial"),
	z.literal("bigserial"),
	z.literal("char"),
	z.literal("varchar"),
	z.literal("text"),
	z.literal("date"),
	z.literal("time"),
	z.literal("timestamp"),
	z.literal("timestamptz"),
	z.literal("interval"),
	z.literal("boolean"),
	z.literal("bytea"),
	z.literal("inet"),
	z.literal("cidr"),
	z.literal("macaddr"),
	z.literal("point"),
	z.literal("line"),
	z.literal("lseg"),
	z.literal("box"),
	z.literal("path"),
	z.literal("polygon"),
	z.literal("circle"),
	z.literal("json"),
	z.literal("jsonb"),
	z.literal("array"),
	z.literal("uuid"),
	z.literal("money"),
	z.literal("xml"),
]);

export const awsRegionsSchema = z.union([
	z.literal("us-east-1"),
	z.literal("us-east-2"),
	z.literal("us-west-2"),
	z.literal("eu-central-1"),
	z.literal("eu-west-1"),
	z.literal("ap-southeast-1"),
	z.literal("ap-northeast-1"),
]);

export const azureRegionsSchema = z.union([
	z.literal("eastus"),
	z.literal("eastus2"),
	z.literal("westus"),
	z.literal("westus2"),
	z.literal("westus3"),
	z.literal("northeurope"),
	z.literal("westeurope"),
]);

export const neonRegionsSchema = z.object({
	aws: awsRegionsSchema,
	azure: azureRegionsSchema,
});

export const neonRegions = {
	aws: [
		"us-east-1",
		"us-east-2",
		"us-west-2",
		"eu-central-1",
		"eu-west-1",
		"ap-southeast-1",
		"ap-northeast-1",
	],
	azure: [
		"eastus",
		"eastus2",
		"westus",
		"westus2",
		"westus3",
		"northeurope",
		"westeurope",
	],
} as const;

export type NeonRegion = (typeof neonRegions)[keyof typeof neonRegions][number];
export type NeonProvider = keyof typeof neonRegions;
