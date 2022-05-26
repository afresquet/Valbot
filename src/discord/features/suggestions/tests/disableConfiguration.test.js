const {
	disableSuggestionsConfiguration,
} = require("../steps/disableConfiguration");

describe("live-role setup command disableConfiguration step", () => {
	const interaction = {
		guild: { id: "guildId" },
	};
	const context = {
		models: {
			SuggestionModel: {
				findOneAndDelete: jest.fn(async () => {}),
			},
		},
	};

	test("deletes the configuration for the guild", async () => {
		const result = await disableSuggestionsConfiguration(
			undefined,
			{
				interaction,
			},
			context
		);

		expect(result).toBe("Suggestions have been disabled.");
		expect(
			context.models.SuggestionModel.findOneAndDelete
		).toHaveBeenCalledWith({
			guildId: interaction.guild.id,
		});
	});
});
