import Discord from "discord.js";
import { fetchReactions } from "../../firebase/fetchReactions";
import { DiscordFeature } from "../../types/Feature";

export const reactions: DiscordFeature = async (discord: Discord.Client) => {
	const channels = await fetchReactions();

	discord.on("message", async message => {
		if (message.author.bot) return;

		const channel = message.channel as Discord.TextChannel;

		if (!channels[channel.name]) return;

		for await (let emote of channels[channel.name].emotes) {
			await message.react(emote);
		}
	});
};
