import { Event } from "../../../types/twitch";

const messageEvent: Event<"message"> = {
	name: "command",
	event: "message",
	execute: async ({ message, self }, event, context) => {
		if (self) return;

		if (!message.startsWith("!")) return;

		const name = message.split(" ")[0].substring(1);

		const command = context.twitch.commands.get(name);

		if (!command) return;

		await command.execute(event, event, context);
	},
};

export default messageEvent;
