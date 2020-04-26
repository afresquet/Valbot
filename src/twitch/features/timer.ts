import { editCommand } from "../../firebase/commands/editCommand";
import { createTimer } from "../../firebase/timer/createTimer";
import { editTimerSetting } from "../../firebase/timer/editTimerSetting";
import { fetchTimerMessages } from "../../firebase/timer/fetchTimerMessages";
import { fetchTimerSettings } from "../../firebase/timer/fetchTimerSettings";
import { removeTimer } from "../../firebase/timer/removeTimer";
import { TwitchFeature } from "../../types/Feature";
import { isMod } from "../helpers/isMod";
import { messageSplitter } from "../helpers/messageSplitter";

interface State {
	[channel: string]: {
		lastTrigger: number;
		messageCount: number;
		messageIndex: number;
	};
}

export const timer: TwitchFeature = async twitch => {
	const state: State = {};
	const messages = await fetchTimerMessages();
	const settings = await fetchTimerSettings();

	twitch.on("chat", (channel, _, message, self) => {
		if (self) return;

		if (messages.length === 0) return;

		if (message.startsWith("!")) return;

		if (!state[channel]) {
			state[channel] = { lastTrigger: 0, messageCount: 1, messageIndex: 0 };
		} else {
			state[channel].messageCount = state[channel].messageCount + 1;
		}

		if (state[channel].messageCount < settings.messages) return;

		if (Date.now() - state[channel].lastTrigger < settings.minutes * 1000 * 60)
			return;

		state[channel] = {
			lastTrigger: Date.now(),
			messageCount: 0,
			messageIndex:
				state[channel].messageIndex + 1 >= messages.length
					? 0
					: state[channel].messageIndex + 1,
		};

		setTimeout(async () => {
			const timer = messages[state[channel].messageIndex];

			if (!timer) return;

			await twitch.say(channel, timer.message);
		}, settings.delay * 1000);
	});

	twitch.on("chat", async (channel, userstate, message, self) => {
		if (self) return;

		if (!isMod(channel, userstate) || !message.startsWith("!")) return;

		const [command, action, name, text] = messageSplitter(message, 3);

		if (command !== "!timer") return;

		const missingArgumentsMessage = `@${userstate.username}, 'missing arguments, use "!timer help".'`;

		if (!action) {
			await twitch.say(channel, missingArgumentsMessage);

			return;
		}

		switch (action) {
			case "add":
			case "create": {
				if (!name || !text) {
					await twitch.say(channel, missingArgumentsMessage);

					break;
				}

				await createTimer(name, text);

				messages.push({ id: name, message: text });

				await twitch.say(
					channel,
					`@${userstate.username}, new message "${name}" was added to the timer!`
				);

				break;
			}

			case "edit":
			case "update": {
				if (!name || !text) {
					await twitch.say(channel, missingArgumentsMessage);

					break;
				}

				await editCommand(name, text);

				const msg = messages.find(m => m.id === name)!;

				msg.message = text;

				await twitch.say(
					channel,
					`@${userstate.username}, timer message "${name}" was updated!`
				);

				break;
			}

			case "delete":
			case "remove": {
				if (!name) {
					await twitch.say(channel, missingArgumentsMessage);

					break;
				}

				await removeTimer(name);

				const msg = messages.find(m => m.id === name)!;

				messages.splice(messages.indexOf(msg), 1);

				await twitch.say(
					channel,
					`@${userstate.username}, message "${name}" was deleted from the timer!`
				);

				break;
			}

			case "set": {
				const [, , setting, value] = messageSplitter(message, 4);

				if (!setting || !value) {
					await twitch.say(channel, missingArgumentsMessage);

					break;
				}

				await editTimerSetting(setting, parseInt(value, 10));

				settings[setting as keyof typeof settings] = parseInt(value, 10);

				await twitch.say(
					channel,
					`@${userstate.username}, timer setting "${setting}" was set to ${value}!`
				);

				break;
			}

			case "help": {
				await twitch.say(
					channel,
					`@${userstate.username}, !timer <action> <name> <message> - Available <actions> are "add", "edit" and "remove"; !timer set <setting> <value> - Available settings are "messages" and "minutes".`
				);

				break;
			}

			default: {
				await twitch.say(
					channel,
					`@${userstate.username}, invalid action, use "!timer help".`
				);

				break;
			}
		}
	});
};
