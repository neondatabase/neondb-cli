import { z } from "zod";

export const INSTANT_NEON_URLS = {
	API: (dbId: string) => {
		const safeUUID = z.string().uuid().parse(dbId);
		return `https://neon.new/api/v1/databases/${safeUUID}`;
	},
	CLAIM_URL: (dbId: string, referrer?: string) =>
		`https://neon.new/claim/${dbId}${referrer ? `?ref=${referrer}` : ""}`,
};
