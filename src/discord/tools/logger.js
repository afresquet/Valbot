import { RichEmbed } from "discord.js";

export default client => {
	return (content = {}, error = false) => {
		const {
			author = {
				name: "Discord",
				icon_url: "https://cdn.discordapp.com/embed/avatars/0.png",
				url: ""
			},
			title = "",
			url = "",
			description = "",
			color = "#36b82cd",
			thumbnail = "https://cdn.discordapp.com/embed/avatars/0.png",
			image = "",
			fields = [],
			footer = { text: "", icon_url: "" },
			timestamp
		} = content;

		const logsChannel = client.channels.find(c => c.name === "bot-logs");

		const richEmbed = new RichEmbed({ fields })
			.setAuthor(author.name, author.icon_url, author.url)
			.setTitle(title)
			.setURL(url)
			.setDescription(description)
			.setColor(error ? "#ff0000" : color)
			.setThumbnail(thumbnail)
			.setImage(image)
			.setFooter(footer.text, footer.icon_url)
			.setTimestamp(timestamp);

		logsChannel.send(richEmbed);
	};
};
