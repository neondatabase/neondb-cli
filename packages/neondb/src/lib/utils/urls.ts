export const LAUNCHPAD_URLS = {
	// API: (dbId: string) => `https://neon.new/api/v1/databases/${dbId}`,
	GET_DATABASE_DATA: (dbId: string) =>
		`http://localhost:3200/api/v1/database/${dbId}`,
	// CLAIM_URL: (referrer?: string) =>
	// 	`https://neon.new/db${referrer ? `?ref=${referrer}` : ""}`,
	CREATE_CLAIMABLE_DATABASE: (dbId: string, referrer?: string) =>
		`http://localhost:5173/db?uuid=${dbId}${
			referrer ? `&ref=${referrer}` : ""
		}`,
};
