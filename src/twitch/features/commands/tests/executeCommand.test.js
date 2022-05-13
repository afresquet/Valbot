const { executeCommand } = require("../steps/executeCommand");

describe("executeCommand step", () => {
	const name = "command";
	const command = { execute: jest.fn() };
	const event = { channel: "#channel" };
	const context = {
		twitch: {
			commands: new Map(),
		},
	};

	context.twitch.commands.set(name, command);

	beforeEach(jest.clearAllMocks);

	test("executes the command", async () => {
		await executeCommand(name, event, context);

		expect(command.execute).toHaveBeenCalledWith(event, event, context);
	});

	test("throws ExitError if the command doesn't exist", () => {
		const fn = () => executeCommand("bad_command", event, context);

		expect(fn).rejects.toThrowError("ExitError");
		expect(command.execute).not.toHaveBeenCalled();
	});
});
