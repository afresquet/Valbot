const { Collection } = require("discord.js");

const interactionCreateEvent = require("../interactionCreate").default;

describe("interactionCreate interaction event", () => {
	const interaction = {
		client: {
			commands: new Collection(),
		},
		commandName: "command",
		isCommand: jest.fn(() => true),
		reply: jest.fn(),
	};

	const command = { execute: jest.fn() };

	interaction.client.commands.set("command", command);

	beforeEach(jest.clearAllMocks);

	test("runs a command", async () => {
		await interactionCreateEvent.execute(interaction);

		expect(interaction.isCommand).toHaveBeenCalled();
		expect(interaction.reply).not.toHaveBeenCalled();
		expect(command.execute).toHaveBeenCalledWith(interaction);
	});

	test("returns if it's not a command", () => {
		interaction.isCommand.mockReturnValueOnce(false);

		interactionCreateEvent.execute(interaction);

		expect(interaction.isCommand).toHaveBeenCalled();
		expect(interaction.reply).not.toHaveBeenCalled();
	});

	test("returns if the command doesn't exist", async () => {
		jest.spyOn(interaction.client.commands, "delete");

		await interactionCreateEvent.execute({
			...interaction,
			commandName: "not-a-command",
		});

		expect(interaction.reply).toHaveBeenCalledWith({
			embeds: [
				expect.objectContaining({
					description: "An error occurred while running this command.",
				}),
			],
		});
		expect(interaction.client.commands.delete).toHaveBeenCalledWith(
			"not-a-command"
		);
	});

	test("logs errors to console", async () => {
		const error = new Error("error");

		// really don't like how this is done
		interaction.isCommand.mockImplementationOnce(() => {
			throw error;
		});
		jest.spyOn(console, "error").mockImplementation();

		await interactionCreateEvent.execute(interaction);

		expect(console.error).toHaveBeenCalledWith(error);
	});
});
