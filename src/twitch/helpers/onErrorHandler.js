export default client => {
	return (event, callback) => {
		client.on(event, async (...args) => {
			try {
				await callback(...args);
			} catch (error) {
				client.logToDiscord(
					{
						title: `Event: ${event}`,
						description: error.toString(),
						fields: args.map((arg, i) => ({
							name: `Argument ${i + 1}`,
							value: `\`\`\`json\n${JSON.stringify(arg, null, 2)}\n\`\`\``
						}))
					},
					true
				);

				client.opts.channels.forEach(channel => {
					client.say(channel, "An error ocurred, check the logs on Discord!");
				});
			}
		});
	};
};
