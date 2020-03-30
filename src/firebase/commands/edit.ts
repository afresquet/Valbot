import { firebase } from "..";

export const editCommand = async (name: string, message: string) => {
	const ref = firebase.collection("commands").doc(name);

	if (!(await ref.get()).exists) {
		throw new Error(`command ${name} doesn't exist!`);
	}

	const snapshot = await ref.update({ message });

	return snapshot;
};
