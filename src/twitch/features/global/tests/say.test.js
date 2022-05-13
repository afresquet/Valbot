const { say } = require("../steps/say");

describe("say step", () => {
	const message = "message";
	const event = { channel: "#channel" };
	const context = { twitch: { say: jest.fn() } };

	test("says the message", async () => {
		await say(message, event, context);

		expect(context.twitch.say).toHaveBeenCalledWith(event.channel, message);
	});
});
