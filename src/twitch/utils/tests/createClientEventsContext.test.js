const { createClientEventsContext } = require("../createClientEventsContext");

describe("createClientEventsContext util", () => {
	test("connected", () => {
		const event = "connected";
		const address = "127.0.0.1";
		const port = 8080;

		const result = createClientEventsContext(event, address, port);

		expect(result).toStrictEqual({
			address,
			port,
		});
	});

	test("message", () => {
		const event = "message";
		const channel = "channel";
		const userstate = { username: "username" };
		const message = "message";
		const self = false;

		const result = createClientEventsContext(
			event,
			channel,
			userstate,
			message,
			self
		);

		expect(result).toStrictEqual({
			channel,
			userstate,
			message,
			self,
		});
	});

	test("throws error if the event isn't handled", () => {
		const event = "no_event";

		expect(() => createClientEventsContext(event)).toThrowError(
			`Unhandled event: ${event}`
		);
	});
});
