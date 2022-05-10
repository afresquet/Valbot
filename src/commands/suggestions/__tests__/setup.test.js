const suggestionsSetupCommand = require("../setup").default;
const { SuggestionModel } = require("../../../schemas/Suggestion");

describe("live-role setup command", () => {
	const interaction = {
		guild: { id: "guildId" },
		options: {
			getSubcommand: jest.fn(),
			getChannel: jest.fn(),
		},
		reply: jest.fn(),
	};

	const channel = { id: "channelId" };

	beforeEach(() => {
		jest.clearAllMocks();
		interaction.options.getChannel.mockReturnValue(channel);
	});

	test("searches for the configuration with the given guild", async () => {
		jest.spyOn(SuggestionModel, "findByGuild").mockReturnValueOnce();

		await suggestionsSetupCommand.execute(interaction);

		expect(SuggestionModel.findByGuild).toHaveBeenCalledWith(interaction.guild);
	});

	describe("enable", () => {
		beforeEach(() => {
			interaction.options.getSubcommand.mockReturnValue("enable");
		});

		test("enables the feature on the server", async () => {
			jest.spyOn(SuggestionModel, "findByGuild").mockReturnValueOnce();
			jest.spyOn(SuggestionModel, "create").mockReturnValueOnce();

			await suggestionsSetupCommand.execute(interaction);

			expect(SuggestionModel.create).toHaveBeenCalledWith({
				guildId: interaction.guild.id,
				channelId: channel.id,
			});
			expect(interaction.reply).toHaveBeenCalledWith({
				content: "Suggestions are now enabled on this server.",
				ephemeral: true,
			});
		});

		test("ignores if it's already enabled", async () => {
			jest
				.spyOn(SuggestionModel, "findByGuild")
				.mockReturnValueOnce({ enabled: true });

			await suggestionsSetupCommand.execute(interaction);

			expect(interaction.reply).toHaveBeenCalledWith({
				content: "Suggestions are already enabled on this server.",
				ephemeral: true,
			});
		});
	});

	describe("edit", () => {
		beforeEach(() => {
			interaction.options.getSubcommand.mockReturnValue("edit");
		});

		test("enables the feature on the server", async () => {
			jest
				.spyOn(SuggestionModel, "findByGuild")
				.mockReturnValueOnce({ enabled: true });
			jest.spyOn(SuggestionModel, "updateOne").mockReturnValueOnce();

			await suggestionsSetupCommand.execute(interaction);

			expect(SuggestionModel.updateOne).toHaveBeenCalledWith(
				{
					guildId: interaction.guild.id,
				},
				{
					channelId: channel.id,
				}
			);
			expect(interaction.reply).toHaveBeenCalledWith({
				content: "Suggestions channel has been updated.",
				ephemeral: true,
			});
		});

		test("fails if its not setup beforehand", async () => {
			jest.spyOn(SuggestionModel, "findByGuild").mockReturnValueOnce();

			await suggestionsSetupCommand.execute(interaction);

			expect(interaction.reply).toHaveBeenCalledWith({
				content: "Suggestions are not enabled on this server.",
				ephemeral: true,
			});
		});
	});

	describe("disable", () => {
		beforeEach(() => {
			interaction.options.getSubcommand.mockReturnValue("disable");
		});

		test("disables the feature on the server", async () => {
			jest
				.spyOn(SuggestionModel, "findByGuild")
				.mockReturnValueOnce({ enabled: true });
			jest.spyOn(SuggestionModel, "findOneAndDelete").mockReturnValueOnce();

			await suggestionsSetupCommand.execute(interaction);

			expect(SuggestionModel.findOneAndDelete).toHaveBeenCalledWith({
				guildId: interaction.guild.id,
			});
			expect(interaction.reply).toHaveBeenCalledWith({
				content: "Suggestions have been disabled.",
				ephemeral: true,
			});
		});

		test("fails if its not setup beforehand", async () => {
			jest.spyOn(SuggestionModel, "findByGuild").mockReturnValueOnce();

			await suggestionsSetupCommand.execute(interaction);

			expect(interaction.reply).toHaveBeenCalledWith({
				content: "Suggestions are not enabled on this server.",
				ephemeral: true,
			});
		});
	});

	test("logs errors to console", async () => {
		const error = new Error("error");

		// really don't like how this is done
		interaction.options.getSubcommand.mockImplementationOnce(() => {
			throw error;
		});
		jest.spyOn(console, "error").mockImplementation();

		await suggestionsSetupCommand.execute(interaction);

		expect(console.error).toHaveBeenCalledWith(error);
	});
});
