const { createClientEventsContext } = require("../createClientEventsContext");

describe("createClientEventsContext util", () => {
	test("interactionCreate", () => {
		const event = "interactionCreate";
		const interaction = { channelId: "channelId" };

		const result = createClientEventsContext(event, interaction);

		expect(result).toStrictEqual({ interaction });
	});

	test("presenceUpdate", () => {
		const event = "presenceUpdate";
		const oldPresence = { active: false };
		const newPresence = { active: true };

		const result = createClientEventsContext(event, oldPresence, newPresence);

		expect(result).toStrictEqual({ oldPresence, newPresence });
	});

	test("ready", () => {
		const event = "ready";
		const client = { username: "username" };

		const result = createClientEventsContext(event, client);

		expect(result).toStrictEqual({ client });
	});

	test("throws error if the event isn't handled", () => {
		const event = "no_event";

		expect(() => createClientEventsContext(event)).toThrowError(
			`Unhandled event: ${event}`
		);
	});
});
