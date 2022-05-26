import { Event } from "../../../types/discord";

const readyEvent: Event<"ready"> = {
	name: "connected",
	event: "ready",
	execute: (_, { client }) => {
		console.log(`Connected to Discord as ${client.user.tag}`);
	},
};

export default readyEvent;
