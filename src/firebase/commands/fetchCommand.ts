import { firebase } from "..";

export const fetchCommand = async (command: string) => {
	const snapshot = await firebase
		.collection("commands")
		.doc(command)
		.get();

	if (!snapshot.exists) return null;

	return snapshot.data()!.message;
};
