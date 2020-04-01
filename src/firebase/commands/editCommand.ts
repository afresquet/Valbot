import { firebase } from "..";

export const editCommand = async (name: string, message: string) => {
	const ref = firebase.collection("commands").doc(name);

	if (!(await ref.get()).exists) {
		throw new Error(`command ${name} doesn't exist!`);
	}

	return ref.update({ message });
};
