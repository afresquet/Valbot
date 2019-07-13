export default client => {
	const state = {
		lastTrigger: 0,
		messageCount: 0,
		messageIndex: 0
	};

	const messages = [
		"Join the Discord server to keep in touch while offline! https://discord.gg/ScYmxT5 valaxoLove",
		"Follow me on Twitter! https://www.twitter.com/valaxor valaxoSmile",
		"All of the sketches of my emotes are available as FFZ emotes, spam them to your hearts content ValaxorSmile ValaxorLag ValaxorJebaited ValaxorTOXIC ValaxorLove ValaxorNoBully ValaxorYesBully ValaxorSplit ValaxorChokeobo"
	];

	client.on("chat", (channel, userstate, message, self) => {
		if (self) return;

		state.messageCount += 1;

		if (state.messageCount < 15) return;

		if (Date.now() - state.lastTrigger < 15 * 1000 * 60) return;

		client.say(channel, messages[state.messageIndex]);

		state.lastTrigger = Date.now();
		state.messageCount = 0;
		state.messageIndex =
			state.messageIndex + 1 >= messages.length ? 0 : state.messageIndex + 1;
	});
};
