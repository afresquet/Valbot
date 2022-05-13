const pingCommand = require("../commands/ping").default;

describe("ping command", () => {
	test("replies with client ping", () => {
		const event = {
			channel: "channel",
		};
		const context = {
			twitch: {
				say: jest.fn(),
			},
		};

		pingCommand.execute(event, event, context);

		expect(context.twitch.say).toHaveBeenCalledWith(event.channel, "Pong!");
	});
});
