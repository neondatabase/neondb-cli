const neonColumnTypeStrings = [
	"numeric",
	"decimal",
	"integer",
	"bigint",
	"smallint",
	"real",
	"double",
	"serial",
	"bigserial",
	"char",
	"varchar",
	"text",
	"date",
	"time",
	"timestamp",
	"timestamptz",
	"interval",
	"boolean",
	"bytea",
	"inet",
	"cidr",
	"macaddr",
	"point",
	"line",
	"lseg",
	"box",
	"path",
	"polygon",
	"circle",
	"json",
	"jsonb",
	"array",
	"uuid",
	"money",
	"xml",
] as const;

export const neonColumnTypeOptions = neonColumnTypeStrings.map((type) => ({
	value: type,
	label: type,
}));

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
