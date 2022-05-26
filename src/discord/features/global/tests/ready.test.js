const readyEvent = require("../events/ready").default;

describe("ready client event", () => {
	const client = {
		user: {
			tag: "client_tag",
		},
	};

	test("logs the client tag to the console", () => {
		jest.spyOn(console, "log").mockImplementation();

		readyEvent.execute(undefined, { client });

		expect(console.log).toHaveBeenCalledWith(
			`Connected to Discord as ${client.user.tag}`
		);
	});
});
