import { Event } from "../../../types/twitch";

const messageEvent: Event<"message"> = {
	name: "command",
	event: "message",
	execute: client => async (channel, userstate, message, self) => {
		if (self) return;

		if (!message.startsWith("!")) return;

		const command = client.commands.get(message.split(" ")[0].substring(1));

		if (!command) return;

		await command.execute(client)(channel, userstate, message, self);
	},
};

export default messageEvent;
