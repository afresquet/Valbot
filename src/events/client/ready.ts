import { Event } from "../../types/discord";

const eventReady: Event<"ready"> = {
	name: "connected",
	event: "ready",
	execute: client => {
		console.log(`Connected as ${client.user.tag}`);
	},
};

export default eventReady;
