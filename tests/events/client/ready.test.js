const readyEvent = require("../../../src/events/client/ready").default;

describe("ready client event", () => {
	const client = {
		user: {
			tag: "client_tag",
		},
	};

	test("logs the client tag to the console", () => {
		jest.spyOn(console, "log");

		readyEvent.execute(client);

		expect(console.log).toHaveBeenCalledWith(`Connected as ${client.user.tag}`);
	});
});
