import { Events } from "tmi.js";
import { ClientEventsContext } from "../types/twitch";

// The 'anys' don't hurt the type checking, maybe I'll figure out how to properly fix this later
export const createClientEventsContext = <T extends keyof ClientEventsContext>(
	event: T,
	...args: Parameters<Events[T]>
): ClientEventsContext[T] => {
	if (event === "connected") {
		const [address, port] = args as Parameters<Events["connected"]>;

		return { address, port } as any;
	}

	if (event === "message") {
		const [channel, userstate, message, self] = args as Parameters<
			Events["message"]
		>;

		return { channel, userstate, message, self } as any;
	}

	throw new Error(`Unhandled event: ${event}`);
};
