import Discord from "discord.js";
import { logToDiscord } from ".";

export const logFromTwitch = async (
	content: Discord.MessageEmbedOptions,
	error: boolean = false
) =>
	await logToDiscord({
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
