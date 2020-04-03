import { editCommand } from "../../firebase/commands/editCommand";
import { createTimer } from "../../firebase/timer/createTimer";
import { editTimerSetting } from "../../firebase/timer/editTimerSetting";
import { fetchTimerMessages } from "../../firebase/timer/fetchTimerMessages";
import { fetchTimerSettings } from "../../firebase/timer/fetchTimerSettings";
import { removeTimer } from "../../firebase/timer/removeTimer";
import { useState } from "../../helpers/useState";
import { TwitchFeature } from "../../types/Feature";
import { isMod } from "../tools/isMod";
import { messageSplitter } from "../tools/messageSplitter";

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

		setState(prev => ({
			...prev,
			[channel]: prev[channel]
				? {
						...prev[channel],
						messageCount: prev[channel].messageCount + 1,
				  }
				: { lastTrigger: 0, messageCount: 1, messageIndex: 0 },
		}));

		if (state()[channel].messageCount < settings()!.messages) return;

		if (
			Date.now() - state()[channel].lastTrigger <
			settings()!.minutes * 1000 * 60
		)
			return;

		setState(prev => ({
			...prev,
			[channel]: {
				lastTrigger: Date.now(),
				messageCount: 0,
				messageIndex:
					prev[channel].messageIndex + 1 >= messages().length
						? 0
						: prev[channel].messageIndex + 1,
			},
		}));

		setTimeout(() => {
			twitch.say(channel, messages()[state()[channel].messageIndex].message);
		}, settings()!.delay * 1000);
	});

	twitch.on("chat", async (channel, userstate, message, self) => {
		if (self) return;

		if (!isMod(channel, userstate) || !message.startsWith("!")) return;

		const [command, action, name, text] = messageSplitter(message, 3);

		if (command !== "!timer") return;

		const missingArgumentsMessage = `@${userstate.username}, 'missing arguments, use "!timer help".'`;

		if (!action) {
			twitch.say(channel, missingArgumentsMessage);

			return;
		}

		switch (action) {
			case "add":
			case "create": {
				if (!name || !text) {
					twitch.say(channel, missingArgumentsMessage);

					break;
				}

				await createTimer(name, text);

				setMessages(prev => [...prev, { id: name, message: text }]);

				twitch.say(
					channel,
					`@${userstate.username}, new message "${name}" was added to the timer!`
				);

				break;
			}

			case "edit":
			case "update": {
				if (!name || !text) {
					twitch.say(channel, missingArgumentsMessage);

					break;
				}

				await editCommand(name, text);

				setMessages(prev =>
					prev.map(msg => (msg.id === name ? { id: name, message: text } : msg))
				);

				twitch.say(
					channel,
					`@${userstate.username}, timer message "${name}" was updated!`
				);

				break;
			}

			case "delete":
			case "remove": {
				if (!name) {
					twitch.say(channel, missingArgumentsMessage);

					break;
				}

				await removeTimer(name);

				setMessages(prev => prev.filter(msg => msg.id !== name));

				twitch.say(
					channel,
					`@${userstate.username}, message "${name}" was deleted from the timer!`
				);

				break;
			}

			case "set": {
				const [, , setting, value] = messageSplitter(message, 4);

				if (!setting || !value) {
					twitch.say(channel, missingArgumentsMessage);

					break;
				}

				await editTimerSetting(setting, parseInt(value, 10));

				setSettings(prev => ({ ...prev, [setting]: parseInt(value, 10) }));

				twitch.say(
					channel,
					`@${userstate.username}, timer setting "${setting}" was set to ${value}!`
				);

				break;
			}

			case "help": {
				twitch.say(
					channel,
					`@${userstate.username}, !timer <action> <name> <message> - Available <actions> are "add", "edit" and "remove"; !timer set <setting> <value> - Available settings are "messages" and "minutes".`
				);

				break;
			}

			default: {
				twitch.say(
					channel,
					`@${userstate.username}, invalid action, use "!timer help".`
				);

				break;
			}
		}
	});
};
