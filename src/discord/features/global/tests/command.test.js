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
			options: {
				getSubcommand: jest.fn(() => event.interaction.commandName),
			},
		},
	};
	const context = { foo: "bar" };

	const command = { execute: jest.fn() };
	const setupCommand = { execute: jest.fn() };

	event.interaction.client.commands.set("command", command);
	event.interaction.client.commands.set("setup-command", setupCommand);

	beforeEach(jest.clearAllMocks);

	test("runs a command", async () => {
		await commandEvent.execute(event, event, context);

		expect(event.interaction.isCommand).toHaveBeenCalled();
		expect(event.interaction.reply).not.toHaveBeenCalled();
		expect(command.execute).toHaveBeenCalledWith(event, event, context);
	});

	test("runs a setup command", async () => {
		const setupEvent = {
			...event,
			interaction: { ...event.interaction, commandName: "setup" },
		};

		await commandEvent.execute(setupEvent, setupEvent, context);

		expect(event.interaction.isCommand).toHaveBeenCalled();
		expect(event.interaction.reply).not.toHaveBeenCalled();
		expect(setupCommand.execute).toHaveBeenCalledWith(
			setupEvent,
			setupEvent,
			context
		);
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
			event,
			{
				interaction: {
					...event.interaction,
					commandName: "not-a-command",
				},
			},
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
