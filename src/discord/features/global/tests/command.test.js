const { Collection } = require("discord.js");

const commandEvent = require("../events/command").default;

describe("interactionCreate interaction event", () => {
	const event = {
		interaction: {
			client: {
				commands: new Collection(),
			},
			commandName: "command",
			isCommand: jest.fn(() => true),
			reply: jest.fn(),
		},
	};
	const context = { foo: "bar" };

	const command = { execute: jest.fn() };

	event.interaction.client.commands.set("command", command);

	beforeEach(jest.clearAllMocks);

	test("runs a command", async () => {
		await commandEvent.execute(event, event, context);

		expect(event.interaction.isCommand).toHaveBeenCalled();
		expect(event.interaction.reply).not.toHaveBeenCalled();
		expect(command.execute).toHaveBeenCalledWith(event, event, context);
	});

	test("returns if it's not a command", () => {
		event.interaction.isCommand.mockReturnValueOnce(false);

		commandEvent.execute(event, event, context);

		expect(event.interaction.isCommand).toHaveBeenCalled();
		expect(event.interaction.reply).not.toHaveBeenCalled();
	});

	test("returns if the command doesn't exist", async () => {
		jest.spyOn(event.interaction.client.commands, "delete");

		await commandEvent.execute(
			{
				interaction: {
					...event.interaction,
					commandName: "not-a-command",
				},
			},
			event,
			context
		);

		expect(event.interaction.reply).toHaveBeenCalledWith({
			embeds: [
				expect.objectContaining({
					description: "An error occurred while running this command.",
				}),
			],
		});
		expect(event.interaction.client.commands.delete).toHaveBeenCalledWith(
			"not-a-command"
		);
	});
});
