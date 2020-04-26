import tmi from "tmi.js";
import { logFromTwitch } from "../../helpers/logging/logFromTwitch";

type ListenerType<T> = [T] extends [(...args: infer U) => any]
	? U
	: [T] extends [never]
	? []
	: [T];

export const logTwitchError = async (
	error: any,
	event: string,
	args: any[]
) => {
	await logFromTwitch(
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
};

export const twitchEventErrorHandler = (twitch: tmi.Client) => {
	const originalOn: typeof twitch.on = twitch.on.bind(twitch);

	return <T extends keyof tmi.Events>(
		event: T,
		listener: (...args: ListenerType<tmi.Events[T]>) => void | Promise<void>
	) => {
		originalOn(event, async (...args) => {
			try {
				await listener.apply(twitch, args);
			} catch (error) {
				await logTwitchError(error, event, args);

				for (const channel of twitch.getOptions().channels!) {
					await twitch.say(
						channel,
						"An error ocurred, check the logs on Discord!"
					);
				}
			}
		});

		return twitch;
	};
};
