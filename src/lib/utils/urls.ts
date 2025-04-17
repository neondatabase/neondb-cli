import { z } from "zod";

export const INSTANT_NEON_URLS = {
	API: (dbId: string) => {
		const safeUUID = z.string().uuid().parse(dbId);
		return `https://www.instagres.com/api/v1/databases/${safeUUID}`;
	},
	CLAIM_URL: (dbId: string, referrer?: string) =>
		`https://neon-new.vercel.app/claim/${dbId}${
			referrer ? `?ref=${referrer}` : ""
		}`,
};
