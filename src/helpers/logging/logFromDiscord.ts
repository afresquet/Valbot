import Discord from "discord.js";
import { logToDiscord } from ".";

export const logFromDiscord = async (
	content: Discord.MessageEmbedOptions,
	error: boolean = false
) =>
	await logToDiscord({
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
