import { AccessToken } from "twitch";
import { firebase } from ".";

type AccessTokenKeys = "refreshToken" | "expiryDate" | "scope";
type TwitchAccessToken = Pick<AccessToken, AccessTokenKeys>;

export const fetchTwitchAccessToken = async (): Promise<TwitchAccessToken> => {
	const snapshot = await firebase
		.collection("settings")
		.doc("client-credentials")
		.get();

	return snapshot.data() as TwitchAccessToken;
};

export const setTwitchAccessToken = (token: AccessToken) => {
	const ref = firebase.collection("settings").doc("client-credentials");

	return ref.update({
		refreshToken: token.refreshToken,
		expiryDate: token.expiryDate,
		scope: token.scope,
	});
};
