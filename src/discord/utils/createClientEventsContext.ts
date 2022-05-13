import type { ClientEvents } from "discord.js";
import { ClientEventsContext } from "../types/discord";

// The 'anys' don't hurt the type checking, maybe I'll figure out how to properly fix this later
export const createClientEventsContext = <T extends keyof ClientEventsContext>(
	event: T,
	...args: ClientEvents[T]
): ClientEventsContext[T] => {
	if (event === "interactionCreate") {
		const [interaction] = args as ClientEvents["interactionCreate"];

		return { interaction } as any;
	}

	if (event === "presenceUpdate") {
		const [oldPresence, newPresence] = args as ClientEvents["presenceUpdate"];

		return { oldPresence, newPresence } as any;
	}

	if (event === "ready") {
		const [client] = args as ClientEvents["ready"];

		return { client } as any;
	}

	throw new Error(`Unhandled event: ${event}`);
};
