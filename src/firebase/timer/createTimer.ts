import { firebase } from "..";

export const createTimer = async (name: string, message: string) => {
	const ref = firebase.collection("timer").doc(name);

	if ((await ref.get()).exists) {
		throw new Error(`timer message "${name}" already exists!`);
	}

	return ref.set({ message });
};
