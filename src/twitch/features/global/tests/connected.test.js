const connectedEvent = require("../events/connected").default;

describe("ready client event", () => {
	const username = "username";
	const context = {
		twitch: {
			getUsername: jest.fn(() => username),
		},
	};

	test("logs the client tag to the console", () => {
		jest.spyOn(console, "log").mockImplementation();

		connectedEvent.execute({}, {}, context);

		expect(context.twitch.getUsername).toHaveBeenCalled();
		expect(console.log).toHaveBeenCalledWith(
			`Connected to Twitch as ${username}!`
		);
	});
});
