const { editSuggestionsConfiguration } = require("../steps/editConfiguration");

describe("live-role setup command editConfiguration step", () => {
	const channel = { id: "channelId" };
	const interaction = {
		guild: { id: "guildId" },
	};
	const context = {
		models: {
			SuggestionModel: {
				updateOne: jest.fn(async () => {}),
			},
		},
	};

	test("modifies the configuration for the guild", async () => {
		const result = await editSuggestionsConfiguration(
			channel,
			{ interaction },
			context
		);

		expect(result).toBe("Suggestions channel has been updated.");
		expect(context.models.SuggestionModel.updateOne).toHaveBeenCalledWith(
			{
				guildId: interaction.guild.id,
			},
			{
				channelId: channel.id,
			}
		);
	});
});
