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

		const result = await disableSuggestionsConfiguration(undefined, {
			interaction,
		});

		expect(result).toBe("Suggestions have been disabled.");
		expect(SuggestionModel.findOneAndDelete).toHaveBeenCalledWith({
			guildId: interaction.guild.id,
		});
	});
});
