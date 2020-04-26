import { HelixUser } from "twitch";
import PubSubRedemptionMessage from "twitch-pubsub-client/lib/Messages/PubSubRedemptionMessage";

export enum PubSubEvents {
	REDEMPTION = "redepmtion",
}

export interface PubSubEventListeners {
	[PubSubEvents.REDEMPTION](
		channel: string,
		userstate: HelixUser,
		redemption: PubSubRedemptionMessage,
		self: boolean
	): void | Promise<void>;
}
