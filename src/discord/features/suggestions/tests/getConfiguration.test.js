const { getSuggestionsConfiguration } = require("../steps/getConfiguration");

describe("suggestions setup command getConfiguration step", () => {
	const interaction = {
		guild: { id: "guildId" },
	};
	const value = "value";
	const context = {
		models: {
			SuggestionModel: {
				findByGuild: jest.fn(async () => value),
			},
		},
	};

	test("returns the value of the guild's suggestions configuration", async () => {
		const result = await getSuggestionsConfiguration(
			undefined,
			{
				interaction,
			},
			context
		);

		expect(result).toStrictEqual({ interaction, configuration: value });
		expect(context.models.SuggestionModel.findByGuild).toHaveBeenCalledWith(
			interaction.guild
		);
	});
});
