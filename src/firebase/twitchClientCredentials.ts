import { AccessToken } from "twitch";
import { firebase } from ".";

interface TwitchClientCredentials {
	refreshToken: string;
	expiryDate: Date | null;
	scope: string[];
}

export const fetchTwitchClientCredentials = async (): Promise<TwitchClientCredentials> => {
	const snapshot = await firebase
		.collection("settings")
		.doc("client-credentials")
		.get();

	return snapshot.data() as TwitchClientCredentials;
};

export const setTwitchClientCredentials = (token: AccessToken) => {
	const ref = firebase.collection("settings").doc("client-credentials");

	return ref.update({
		refreshToken: token.refreshToken,
		expiryDate: token.expiryDate,
		scope: token.scope,
	});
};
