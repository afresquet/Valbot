import { firebase } from ".";
import { prefixChannel } from "../discord/tools/prefixChannel";

interface ReactionChannels {
	[channel: string]: {
		emotes: string[];
	};
}

export const fetchReactions = async (): Promise<ReactionChannels> => {
	const snapshot = await firebase.collection("reactions").get();

	return snapshot.docs.reduce(
		(result, doc) => ({ ...result, [prefixChannel(doc.id)]: doc.data() }),
		{}
	);
};
