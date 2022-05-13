import { Context } from "../../types/Context";
import { ClientEventsContext } from "../types/twitch";
import { TwitchErrors } from "./TwitchErrors";

export const errorHandler: <
	E extends Error,
	Event extends keyof ClientEventsContext
>(
	error: E,
	event: ClientEventsContext[Event],
	context: Context
) => Promise<void> = async (error, event) => {
	if (error instanceof TwitchErrors.Exit) return;

	console.error(error, event);
};
