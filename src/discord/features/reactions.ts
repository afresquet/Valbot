import Discord from "discord.js";
import { fetchReactions } from "../../firebase/fetchReactions";
import { DiscordFeature } from "../../types/Feature";
import { emojiRegex } from "../helpers/regex";

export const reactions: DiscordFeature = async discord => {
	const channels = await fetchReactions();

	discord.on("message", async message => {
		if (message.author.bot) return;

		const channel = message.channel as Discord.TextChannel;

		if (!channels.hasOwnProperty(channel.name)) return;

		for (const emote of channels[channel.name].emotes) {
			const emoji = emojiRegex.test(emote)
				? message.guild!.emojis.resolve(emojiRegex.exec(emote)![1])!
				: emote;

			await message.react(emoji);
		}
	});
};
