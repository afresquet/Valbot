import { firebase } from "..";

export const editTimerSetting = async (setting: string, value: number) => {
	if (!["minutes", "messages", "delay"].includes(setting)) {
		throw new Error(
			'invalid setting, possible settings are "minutes" and "messages".'
		);
	}

	if (Number.isNaN(value)) {
		throw new Error("invalid value provided, it must be a number.");
	}

	const ref = firebase.collection("settings").doc("timer");

	return ref.update({ [setting]: value });
};
