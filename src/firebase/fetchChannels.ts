import { firebase } from ".";

export const fetchChannels = async (): Promise<string[]> => {
	const document = await firebase
		.collection("settings")
		.doc("twitch-channels")
		.get();

	if (!document.exists) {
		throw new Error("No channels in database '/settings/twitch-channels'");
	}

	return document.data()!.channels;
};
