import { Events } from "tmi.js";
import { twitch } from "..";
import { logFromTwitch } from "../../discord/tools/logToDiscord";

type ListenerType<T> = [T] extends [(...args: infer U) => any]
	? U
	: [T] extends [never]
	? []
	: [T];

type ListenerArgs<T extends keyof Events> = ListenerType<Events[T]>;

type Listener<T extends keyof Events> = (...args: ListenerArgs<T>) => void;

export const withErrorHandler = <T extends keyof Events>(
	event: T,
	listener: Listener<T>
): [T, Listener<T>] => {
	return [
		event,
		async (...args: ListenerArgs<T>) => {
			try {
				await listener(...args);
			} catch (error) {
				logFromTwitch(
					{
						title: `Event: ${event}`,
						description: error.toString(),
						fields: (args as ListenerArgs<T>[]).map((arg, i) => ({
							name: `Argument ${i + 1}`,
							value: `\`\`\`json\n${JSON.stringify(arg, null, 2)}\n\`\`\``,
						})),
					},
					true
				);

				twitch.getOptions().channels?.forEach(channel => {
					twitch.say(channel, "An error ocurred, check the logs on Discord!");
				});
			}
		},
	];
};
