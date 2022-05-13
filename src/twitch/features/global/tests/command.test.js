const commandEvent = require("../events/command").default;

describe("interactionCreate interaction event", () => {
	const event = {
		message: "!command",
		self: false,
	};
	const context = {
		twitch: {
			commands: new Map(),
		},
	};

	const command = { execute: jest.fn() };

	context.twitch.commands.set("command", command);

	beforeEach(jest.clearAllMocks);

	test("runs a command", async () => {
		await commandEvent.execute(event, event, context);

		expect(command.execute).toHaveBeenCalledWith(event, event, context);
	});

	test("returns if it's itself", () => {
		const e = {
			...event,
			self: true,
		};

		commandEvent.execute(e, e, context);

		expect(command.execute).not.toHaveBeenCalled();
	});

	test("returns if the message doesn't start with the prefix", () => {
		const e = {
			...event,
			message: "message",
		};

		commandEvent.execute(e, e, context);

		expect(command.execute).not.toHaveBeenCalled();
	});

	test("returns if the command doesn't exist", async () => {
		jest.spyOn(context.twitch.commands, "get").mockReturnValueOnce(null);

		await commandEvent.execute(event, event, context);

		expect(command.execute).not.toHaveBeenCalled();
	});
});
