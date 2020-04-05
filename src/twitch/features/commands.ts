import { createCommand } from "../../firebase/commands/createCommand";
import { editCommand } from "../../firebase/commands/editCommand";
import { fetchCommand } from "../../firebase/commands/fetchCommand";
import { removeCommand } from "../../firebase/commands/removeCommand";
import { TwitchFeature } from "../../types/Feature";
import { isMod } from "../tools/isMod";
import { messageSplitter } from "../tools/messageSplitter";

export const commands: TwitchFeature = twitch => {
	twitch.on("chat", async (channel, _, message, self) => {
		if (self) return;

		if (!message.startsWith("!") || message.startsWith("!commands")) return;

		const [command] = messageSplitter(message);

		const content = await fetchCommand(command);

		if (!content) return;

		await twitch.say(channel, content);
	});

	twitch.on("chat", async (channel, userstate, message, self) => {
		if (self) return;

		if (!isMod(channel, userstate)) return;

		const [command, action, name, text] = messageSplitter(message, 3);

		if (command !== "!commands") return;

		const missingArgumentsMessage = `@${userstate.username}, missing arguments, use "!commands help".`;

		if (!action) {
			await twitch.say(channel, missingArgumentsMessage);

			return;
		}

		const commandName = name.startsWith("!") ? name : `!${name}`;

		switch (action) {
			case "add":
			case "create": {
				if (!name || !text) {
					await twitch.say(channel, missingArgumentsMessage);

					break;
				}

				await createCommand(commandName, text);

				await twitch.say(
					channel,
					`@${userstate.username}, command ${commandName} was added!`
				);

				break;
			}

			case "edit":
			case "update": {
				if (!name || !text) {
					await twitch.say(channel, missingArgumentsMessage);

					break;
				}

				await editCommand(commandName, text);

				await twitch.say(
					channel,
					`@${userstate.username}, command ${commandName} was edited!`
				);

				break;
			}

			case "delete":
			case "remove": {
				if (!name) {
					await twitch.say(channel, missingArgumentsMessage);

					break;
				}

				await removeCommand(commandName);

				await twitch.say(
					channel,
					`@${userstate.username}, command "${commandName}" was removed!`
				);

				break;
			}

			case "help": {
				await twitch.say(
					channel,
					`@${userstate.username}, !commands <action> <name> <message> - Available <actions> are "add", "edit" and "remove".`
				);

				break;
			}

			default: {
				await twitch.say(
					channel,
					`@${userstate.username}, invalid action, use "!commands help".`
				);

				break;
			}
		}
	});
};
