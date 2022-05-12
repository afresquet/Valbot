const {
	disableSuggestionsConfiguration,
} = require("../../../../src/commands/suggestions/steps/disableConfiguration");
const { SuggestionModel } = require("../../../../src/schemas/Suggestion");

describe("live-role setup command disableConfiguration step", () => {
	const interaction = {
		guild: { id: "guildId" },
	};

	test("deletes the configuration for the guild", async () => {
		jest.spyOn(SuggestionModel, "findOneAndDelete").mockReturnValueOnce();

		await disableSuggestionsConfiguration(undefined, { interaction });

		expect(SuggestionModel.findOneAndDelete).toHaveBeenCalledWith({
			guildId: interaction.guild.id,
		});
	});
});
