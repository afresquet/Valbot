import { firebase } from "..";

interface TimerSettings {
	messages: number;
	minutes: number;
	delay: number;
}

export const fetchTimerSettings = async (): Promise<TimerSettings> => {
	const snapshot = await firebase
		.collection("settings")
		.doc("timer")
		.get();

	return snapshot.data() as TimerSettings;
};
