import { firebase } from "..";

export const fetchTimerSettings = async () => {
	const snapshot = await firebase
		.collection("settings")
		.doc("timer")
		.get();

	return snapshot.data();
};
