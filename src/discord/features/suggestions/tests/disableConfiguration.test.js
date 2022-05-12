const {
	disableSuggestionsConfiguration,
} = require("../steps/disableConfiguration");
const { SuggestionModel } = require("../schemas/Suggestion");

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
