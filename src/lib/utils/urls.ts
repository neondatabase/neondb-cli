import { z } from "zod";

export const INSTANT_NEON_URLS = {
	API: (dbId: string) => `https://instagres.com/api/v1/databases/${dbId}`,
	CLAIM_URL: (dbId: string, referrer?: string) =>
		`https://neon.new/claim/${dbId}${referrer ? `?ref=${referrer}` : ""}`,
};
