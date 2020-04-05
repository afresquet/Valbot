import { logToDiscord } from ".";
import { discord } from "../../discord";

export const logError = (title: string) => async (error: any) => {
	if (discord.readyAt === null) {
		console.log(error);

		return;
	}

	await logToDiscord({ title, description: error.toString() });
};
