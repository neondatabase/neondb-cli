import { INSTAGRES_URLS } from "./urls.js";

export async function createClaimableDatabase(dbId: string, referrer: string) {
	const dbCreation = await fetch(
		INSTAGRES_URLS.CREATE_DATABASE_POST(dbId, referrer),
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	if (!dbCreation.ok) {
		throw new Error("Failed to create database");
	}

	const dbInfo: { connection_string: string } = await fetch(
		INSTAGRES_URLS.GET_DATABASE_DATA(dbId),
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		},
	).then((res) => res.json());

	return dbInfo.connection_string;
}
