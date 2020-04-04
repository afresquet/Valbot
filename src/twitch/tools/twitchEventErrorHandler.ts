import tmi from "tmi.js";
import { logFromTwitch } from "../../discord/tools/logToDiscord";

type ListenerType<T> = [T] extends [(...args: infer U) => any]
	? U
	: [T] extends [never]
	? []
	: [T];

type TwitchOnEvent = <T extends keyof tmi.Events>(
	event: T,
	listener: (...args: ListenerType<tmi.Events[T]>) => void
) => tmi.Client;

export const twitchEventErrorHandler = (twitch: tmi.Client): TwitchOnEvent => {
	const originalOn: TwitchOnEvent = twitch.on.bind(twitch);

	return (event, listener) => {
		originalOn(event, async (...args) => {
			try {
				await listener.call(twitch, ...args);
			} catch (error) {
				logFromTwitch(
					{
						title: `Event: ${event}`,
						description: error.toString(),
						fields: (args as ListenerType<tmi.Events>[]).map((arg, i) => ({
							name: `Argument ${i + 1}`,
							value: `\`\`\`json\n${JSON.stringify(arg, null, 2).substring(
								0,
								1000
							)}\n\`\`\``,
						})),
					},
					true
				);

				twitch.getOptions().channels?.forEach(channel => {
					twitch.say(channel, "An error ocurred, check the logs on Discord!");
				});
			}
		});

		return twitch;
	};
};
