import { HelixUser } from "twitch";
import PubSubRedemptionMessage from "twitch-pubsub-client/lib/Messages/PubSubRedemptionMessage";

export type PubSubListener = (
	channel: string,
	userstate: HelixUser,
	message: PubSubRedemptionMessage
) => void;
