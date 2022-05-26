import { Context } from "../../types/Context";
import { ClientEventsContext } from "../types/twitch";

export const errorHandler: <
	E extends Error,
	Event extends keyof ClientEventsContext
>(
	error: E,
	event: ClientEventsContext[Event],
	context: Context
) => Promise<void> = async (error, event, { Errors }) => {
	if (error instanceof Errors.Exit) return;

	console.error(error, event);
};
