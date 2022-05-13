import { Command } from "../../../types/twitch";

const pingCommand: Command = {
	name: "ping",
	execute: (_, { channel }, { twitch }) => {
		twitch.say(channel, "Pong!");
	},
};

export default pingCommand;
