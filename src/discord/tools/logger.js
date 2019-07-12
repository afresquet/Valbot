import { RichEmbed } from "discord.js";

export default client => {
	return (content = {}, error = false) => {
		const {
			author = {
				name: "Discord",
				icon_url: "https://cdn.discordapp.com/embed/avatars/0.png"
			},
			title,
			url,
			description,
			color = 0x6b82cd,
			thumbnail = "https://cdn.discordapp.com/embed/avatars/0.png",
			image,
			fields = [],
			footer,
			timestamp = Date.now()
		} = content;

		const logsChannel = client.channels.find(c => c.name === "bot-logs");

		const richEmbed = new RichEmbed({
			author,
			title,
			url,
			description,
			color: error ? 0xff0000 : color,
			thumbnail: { url: thumbnail },
			image: { url: image },
			fields,
			footer,
			timestamp
		});

		logsChannel.send(richEmbed);
	};
};
