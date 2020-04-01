import { firebase } from ".";

export const fetchChannels = async (): Promise<string[]> => {
	const snapshot = await firebase
		.collection("settings")
		.doc("twitch-channels")
		.get();

	if (!snapshot.exists) {
		throw new Error("No channels in database '/settings/twitch-channels'");
	}

	return snapshot.data()!.channels;
};
