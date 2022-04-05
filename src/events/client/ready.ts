import { Event } from "../../types/discord";

const eventReady: Event<"ready"> = () => {
	return client => {
		console.log(`Connected as ${client.user.tag}`);
	};
};

export default eventReady;
