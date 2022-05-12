import { Event } from "../../../types/twitch";

const connectedEvent: Event<"connected"> = {
	name: "connected",
	event: "connected",
	execute: client => () => {
		console.log(`Connected to Twitch as ${client.getUsername()}!`);
	},
};

export default connectedEvent;
