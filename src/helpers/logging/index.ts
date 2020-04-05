import Discord from "discord.js";
import { discord } from "../../discord";

export const logToDiscord = async (content: Discord.MessageEmbedOptions) => {
	const channel = discord.channels.cache.find(
		c => (c as Discord.TextChannel).name === "bot-logs"
	) as Discord.TextChannel;

	const embed = new Discord.MessageEmbed(content);

	await channel.send(embed);
};
