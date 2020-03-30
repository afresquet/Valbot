import tmi from "tmi.js";
import { createCommand } from "../../firebase/commands/createCommand";
import { editCommand } from "../../firebase/commands/editCommand";
import { fetchCommand } from "../../firebase/commands/fetchCommand";
import { removeCommand } from "../../firebase/commands/removeCommand";
import { TwitchFeature } from "../../types/Feature";
import messageSplitter from "../tools/messageSplitter";

export const commands: TwitchFeature = (twitch: tmi.Client) => {
	twitch.on("chat", async (channel, _, message, self) => {
		if (self) return;

		if (!message.startsWith("!")) return;

		const [command] = messageSplitter(message);

		if (command === "!commands") return;

		const content = await fetchCommand(command);

		if (!content) return;

		twitch.say(channel, content);
	});

	twitch.on("chat", async (channel, userstate, message, self) => {
		if (self) return;

		if (!userstate.mod) return;

		if (!message.startsWith("!commands")) return;

		const [, action, command, text] = messageSplitter(message, 3);

		try {
			const missingError = new Error(
				'missing arguments, use "!commands help".'
			);

			if (!action) throw missingError;

			const name = command.startsWith("!") ? command : `!${command}`;

			switch (action) {
				case "add":
				case "create":
					if (!command || !text) throw missingError;

					await createCommand(name, text);

					twitch.say(
						channel,
						`@${userstate.username}, command ${name} was added!`
					);

					break;

				case "edit":
				case "update":
					if (!command || !text) throw missingError;

					await editCommand(name, text);

					twitch.say(
						channel,
						`@${userstate.username}, command ${name} was edited!`
					);

					break;

				case "delete":
				case "remove":
					if (!command) throw missingError;

					await removeCommand(name);

					twitch.say(
						channel,
						`@${userstate.username}, command "${name}" was removed!`
					);

					break;

				case "help": {
					twitch.say(
						channel,
						`@${userstate.username}, !commands <action> <name> <message> - Available <actions> are "add", "edit" and "remove".`
					);

					break;
				}

				default: {
					twitch.say(
						channel,
						`@${userstate.username}, invalid action, use "!commands help".`
					);

					break;
				}
			}
		} catch (error) {
			twitch.say(channel, `@${userstate.username}, ${error.message}`);
		}
	});
};
