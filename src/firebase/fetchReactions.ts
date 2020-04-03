import { firebase } from ".";
import { prefixChannel } from "../helpers/prefixString";

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
