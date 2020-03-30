import { firebase } from "..";

export const fetchTimerMessages = async () => {
	const snapshot = await firebase.collection("timer").get();

	return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
};
