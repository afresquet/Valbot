import { editCommand } from "../../firebase/commands/editCommand";
import { createTimer } from "../../firebase/timer/createTimer";
import { editTimerSetting } from "../../firebase/timer/editTimerSetting";
import { fetchTimerMessages } from "../../firebase/timer/fetchTimerMessages";
import { fetchTimerSettings } from "../../firebase/timer/fetchTimerSettings";
import { removeTimer } from "../../firebase/timer/removeTimer";
import { useState } from "../../helpers/useState";
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
	const [state, setState] = useState<State>({});
	const [messages, setMessages] = useState(await fetchTimerMessages());
	const [settings, setSettings] = useState(await fetchTimerSettings());

	twitch.on("chat", (channel, _, message, self) => {
		if (self) return;

		if (messages().length === 0) return;

		if (message.startsWith("!")) return;

		setState(curr => ({
			...curr,
			[channel]: curr[channel]
				? {
						...curr[channel],
						messageCount: curr[channel].messageCount + 1,
				  }
				: { lastTrigger: 0, messageCount: 1, messageIndex: 0 },
		}));

		if (state()[channel].messageCount < settings()!.messages) return;

		if (
			Date.now() - state()[channel].lastTrigger <
			settings()!.minutes * 1000 * 60
		)
			return;

		setState(curr => ({
			...curr,
			[channel]: {
				lastTrigger: Date.now(),
				messageCount: 0,
				messageIndex:
					curr[channel].messageIndex + 1 >= messages().length
						? 0
						: curr[channel].messageIndex + 1,
			},
		}));

		setTimeout(async () => {
			const timer = messages()[state()[channel].messageIndex];

			if (!timer) return;

			await twitch.say(channel, timer.message);
		}, settings()!.delay * 1000);
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

				setMessages(curr => [...curr, { id: name, message: text }]);

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

				setMessages(curr =>
					curr.map(msg => (msg.id === name ? { id: name, message: text } : msg))
				);

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

				setMessages(curr => curr.filter(msg => msg.id !== name));

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

				setSettings(curr => ({ ...curr, [setting]: parseInt(value, 10) }));

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
