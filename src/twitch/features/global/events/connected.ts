import { Event } from "../../../types/twitch";

const connectedEvent: Event<"connected"> = {
	name: "connected",
	event: "connected",
	execute: (_, __, { twitch }) => {
		console.log(`Connected to Twitch as ${twitch.getUsername()}!`);
	},
};

export default connectedEvent;
