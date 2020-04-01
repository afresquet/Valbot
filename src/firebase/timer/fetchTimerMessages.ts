import { firebase } from "..";

interface TimerMessage {
	id: string;
	message: string;
}

export const fetchTimerMessages = async (): Promise<TimerMessage[]> => {
	const snapshot = await firebase.collection("timer").get();

	return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
};
