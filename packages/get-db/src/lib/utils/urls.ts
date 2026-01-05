// const HOST = "https://neon.new";
const HOST = "http://localhost:3200";

export const INSTAGRES_URLS = {
	GET_DATABASE_DATA: (dbId: string) => `${HOST}/api/v1/database/${dbId}`,
	CREATE_CLAIMABLE_DATABASE: (dbId: string, referrer?: string) =>
		`${HOST}/db?uuid=${dbId}${
			referrer ? `&ref=${encodeURIComponent(referrer)}` : ""
		}`,
	CLAIM_DATABASE: (dbId: string) => `${HOST}/database/${dbId}`,
	CREATE_DATABASE_POST: (dbId: string, referrer?: string) =>
		`${HOST}/api/v1/database/${dbId}${
			referrer ? `?referrer=${encodeURIComponent(referrer)}` : ""
		}`,
};
