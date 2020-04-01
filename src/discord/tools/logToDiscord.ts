import Discord from "discord.js";
import { discord } from "..";

export const logToDiscord = (content: Discord.MessageEmbedOptions) => {
	const channel = discord.channels.cache.find(
		c => (c as Discord.TextChannel).name === "bot-logs"
	) as Discord.TextChannel;

	const embed = new Discord.MessageEmbed(content);

	channel.send(embed);
};

export const logFromDiscord = (
	content: Discord.MessageEmbedOptions,
	error: boolean = false
) =>
	logToDiscord({
		...content,
		author: {
			...content.author,
			name: "Discord",
			icon_url: "https://cdn.discordapp.com/embed/avatars/0.png",
		},
		color: error ? "#ff0000" : "#6b82cd",
		thumbnail: {
			url: "https://cdn.discordapp.com/embed/avatars/0.png",
			...content.thumbnail,
		},
	});

export const logFromTwitch = (
	content: Discord.MessageEmbedOptions,
	error: boolean = false
) =>
	logToDiscord({
		...content,
		author: {
			name: "Twitch",
			icon_url:
				"https://seeklogo.com/images/T/twitch-tv-logo-51C922E0F0-seeklogo.com.png",
			...content.author,
		},
		color: error ? "#ff0000" : "#473978",
		thumbnail: {
			url:
				"https://seeklogo.com/images/T/twitch-tv-logo-51C922E0F0-seeklogo.com.png",
			...content.thumbnail,
		},
	});
