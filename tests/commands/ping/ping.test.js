const pingCommand = require("../../../src/commands/ping/ping").default;

describe("ping command", () => {
	test("replies with client ping", () => {
		const interaction = {
			reply: jest.fn(),
			client: {
				ws: {
					ping: 1234,
				},
			},
		};

		pingCommand.execute({ interaction });

		expect(interaction.reply).toHaveBeenCalledWith({
			content: `Pong! Ping is \`${interaction.client.ws.ping}ms\``,
			ephemeral: true,
		});
	});
});
