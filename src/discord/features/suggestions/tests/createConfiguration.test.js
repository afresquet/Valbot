const {
	createSuggestionsConfiguration,
} = require("../steps/createConfiguration");
const { SuggestionModel } = require("../schemas/Suggestion");

describe("live-role setup command createConfiguration step", () => {
	const channel = { id: "channelId" };
	const interaction = {
		guild: { id: "guildId" },
	};

	test("creates a configuration for the guild", async () => {
		const configuration = { guildId: interaction.guild.id, roleId: channel.id };

		jest.spyOn(SuggestionModel, "create").mockReturnValueOnce(configuration);

		const result = await createSuggestionsConfiguration(channel, {
			interaction,
		});

		expect(result).toBe("Suggestions are now enabled on this server.");
		expect(SuggestionModel.create).toHaveBeenCalledWith({
			guildId: interaction.guild.id,
			channelId: channel.id,
		});
	});
});
