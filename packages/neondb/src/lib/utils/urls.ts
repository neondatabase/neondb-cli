export const LAUNCHPAD_URLS = {
	GET_DATABASE_DATA: (dbId: string) =>
		`https://neon.new/api/v1/database/${dbId}`,
	CREATE_CLAIMABLE_DATABASE: (dbId: string, referrer?: string) =>
		`https://neon.new/db?uuid=${dbId}${referrer ? `&ref=${referrer}` : ""}`,
};
