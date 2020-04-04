import Discord from "discord.js";
import { logFromDiscord } from "./logToDiscord";

type DiscordOnEvent = <T extends keyof Discord.ClientEvents>(
	event: T,
	listener: (...args: Discord.ClientEvents[T]) => void
) => Discord.Client;

export const discordEventErrorHandler = (
	discord: Discord.Client
): DiscordOnEvent => {
	const originalOn: DiscordOnEvent = discord.on.bind(discord);

	return (event, listener) => {
		originalOn(event, async (...args) => {
			try {
				await listener(...args);
			} catch (error) {
				logFromDiscord(
					{
						title: `Event: ${event}`,
						description: error.toString(),
						fields: (args as Discord.ClientEvents[]).map((arg, i) => ({
							name: `Argument ${i + 1}`,
							value: `\`\`\`json\n${JSON.stringify(arg, null, 2).substring(
								0,
								1000
							)}\n\`\`\``,
						})),
					},
					true
				);
			}
		});

		return discord;
	};
};
