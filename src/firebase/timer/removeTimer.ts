import { firebase } from "..";

export const removeTimer = async (name: string) => {
	const ref = firebase.collection("timer").doc(name);

	if (!(await ref.get()).exists) {
		throw new Error(`timer message "${name}" doesn't exist!`);
	}

	return ref.delete();
};
