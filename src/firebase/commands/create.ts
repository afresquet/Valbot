import { firebase } from "..";

export const createCommand = async (name: string, message: string) => {
	const ref = firebase.collection("commands").doc(name);

	if ((await ref.get()).exists) {
		throw new Error(`command ${name} already exists!`);
	}

	const snapshot = await ref.set({ message });

	return snapshot;
};
