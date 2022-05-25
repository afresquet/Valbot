const { editSuggestionsConfiguration } = require("../steps/editConfiguration");
const { SuggestionModel } = require("../schemas/Suggestion");

describe("live-role setup command editConfiguration step", () => {
	const channel = { id: "channelId" };
	const interaction = {
		guild: { id: "guildId" },
	};

	test("modifies the configuration for the guild", async () => {
		jest.spyOn(SuggestionModel, "updateOne").mockReturnValueOnce();

		const result = await editSuggestionsConfiguration(channel, { interaction });

		expect(result).toBe("Suggestions channel has been updated.");
		expect(SuggestionModel.updateOne).toHaveBeenCalledWith(
			{
				guildId: interaction.guild.id,
			},
			{
				channelId: channel.id,
			}
		);
	});
});
