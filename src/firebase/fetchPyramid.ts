import { firebase } from ".";
import { randomArrayElement } from "../helpers/randomArrayElement";

interface Pyramid {
	emote: string;
	length: number;
}

export const fetchPyramid = async (): Promise<Pyramid | null> => {
	const snapshot = await firebase
		.collection("settings")
		.doc("pyramid")
		.get();

	if (!snapshot.exists) return null;

	const data = snapshot.data();

	const emote = randomArrayElement(data!.emotes as string[]);

	return { emote, length: data!.length };
};
