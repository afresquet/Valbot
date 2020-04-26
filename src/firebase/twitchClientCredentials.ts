import { AccessToken } from "twitch";
import { firebase } from ".";

type AccessTokenKeys = "refreshToken" | "expiryDate" | "scope";
type TwitchAccessToken = Pick<AccessToken, AccessTokenKeys>;

const accessTokenReference = firebase
	.collection("settings")
	.doc("twitch-access-token");

export const fetchTwitchAccessToken = async (): Promise<TwitchAccessToken> => {
	const snapshot = await accessTokenReference.get();

	return snapshot.data() as TwitchAccessToken;
};

export const setTwitchAccessToken = (token: AccessToken) => {
	return accessTokenReference.update({
		refreshToken: token.refreshToken,
		expiryDate: token.expiryDate,
		scope: token.scope,
	});
};
