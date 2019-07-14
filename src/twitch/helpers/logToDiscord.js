export default discord => {
	return (content, error) =>
		discord.logger(
			{
				author: {
					name: "Twitch",
					icon_url:
						"https://seeklogo.com/images/T/twitch-tv-logo-51C922E0F0-seeklogo.com.png"
				},
				color: "#473978",
				thumbnail:
					"https://seeklogo.com/images/T/twitch-tv-logo-51C922E0F0-seeklogo.com.png",
				...content
			},
			error
		);
};
