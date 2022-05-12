import { Command } from "../../../types/twitch";

const pingCommand: Command = {
	name: "ping",
	execute: client => (channel, userstate) => {
		if ("#" + userstate.username !== channel) return;

		client.say(channel, "Pong!");
	},
};

export default pingCommand;
