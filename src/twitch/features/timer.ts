import tmi from "tmi.js";
import { editCommand } from "../../firebase/commands/editCommand";
import { createTimer } from "../../firebase/timer/createTimer";
import { editTimerSetting } from "../../firebase/timer/editTimerSetting";
import { fetchTimerMessages } from "../../firebase/timer/fetchTimerMessages";
import { fetchTimerSettings } from "../../firebase/timer/fetchTimerSettings";
import { removeTimer } from "../../firebase/timer/removeTimer";
import { useState } from "../../helpers/useState";
import { TwitchFeature } from "../../types/Feature";
import { isMod } from "../tools/isMod";
import messageSplitter from "../tools/messageSplitter";

export const timer: TwitchFeature = async (twitch: tmi.Client) => {
	const [initialMessages, initialSettings] = await Promise.all([
		fetchTimerMessages(),
		fetchTimerSettings(),
	] as const);

	const [_state, setState] = useState({
		lastTrigger: 0,
		messageCount: 0,
		messageIndex: 0,
	});
	const [_messages, setMessages] = useState(initialMessages);
	const [_settings, setSettings] = useState(initialSettings);

	twitch.on("chat", (channel, _, message, self) => {
		if (self) return;

		const [state, messages, settings] = [_state(), _messages(), _settings()];

		if (messages.length === 0) return;

		if (message.startsWith("!")) return;

		setState(prev => ({
			...prev,
			messageCount: prev.messageCount + 1,
		}));

		if (state.messageCount + 1 < settings!.messages) return;

		if (Date.now() - state.lastTrigger < settings!.minutes * 1000 * 60) return;

		setState(prev => ({
			lastTrigger: Date.now(),
			messageCount: 0,
			messageIndex:
				prev.messageIndex + 1 >= messages.length ? 0 : prev.messageIndex + 1,
		}));

		setTimeout(() => {
			twitch.say(channel, messages[state.messageIndex].message);
		}, settings!.delay * 1000);
	});

	twitch.on("chat", async (channel, userstate, message, self) => {
		if (self) return;

		if (!isMod(userstate) || !message.startsWith("!")) return;

		const [command, action, name, text] = messageSplitter(message, 3);

		if (command !== "!timer") return;

		try {
			const missingError = new Error('missing arguments, use "!timer help".');

			if (!action) throw missingError;

			switch (action) {
				case "add":
				case "create": {
					if (!name || !text) throw missingError;

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
					if (!name || !text) throw missingError;

					await editCommand(name, text);

					setMessages(prev =>
						prev.map(msg =>
							msg.id === name ? { id: name, message: text } : msg
						)
					);

					twitch.say(
						channel,
						`@${userstate.username}, timer message "${name}" was updated!`
					);

					break;
				}

				case "delete":
				case "remove": {
					if (!name) throw missingError;

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

					if (!setting || !value) throw missingError;

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
		} catch (error) {
			twitch.say(channel, `@${userstate.username}, ${error.message}`);
		}
	});
};