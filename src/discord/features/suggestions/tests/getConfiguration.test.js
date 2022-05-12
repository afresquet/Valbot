const { getSuggestionsConfiguration } = require("../steps/getConfiguration");
const { SuggestionModel } = require("../schemas/Suggestion");

describe("suggestions setup command getConfiguration step", () => {
	const interaction = {
		guild: { id: "guildId" },
	};

	test("returns the value of the guild's suggestions configuration", async () => {
		const value = "value";

		jest.spyOn(SuggestionModel, "findByGuild").mockReturnValueOnce(value);

		const result = await getSuggestionsConfiguration(undefined, {
			interaction,
		});

		expect(result).toBe(value);
		expect(SuggestionModel.findByGuild).toHaveBeenCalledWith(interaction.guild);
	});
});
