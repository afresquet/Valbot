const {
	createSuggestionsConfiguration,
} = require("../../../../src/commands/suggestions/steps/createConfiguration");
const { SuggestionModel } = require("../../../../src/schemas/Suggestion");

describe("live-role setup command createConfiguration step", () => {
	const channel = { id: "channelId" };
	const interaction = {
		guild: { id: "guildId" },
		options: {
			getChannel: jest.fn(() => channel),
		},
	};

	test("creates a configuration for the guild", async () => {
		const configuration = { guildId: interaction.guild.id, roleId: channel.id };

		jest.spyOn(SuggestionModel, "create").mockReturnValueOnce(configuration);

		const result = await createSuggestionsConfiguration(undefined, {
			interaction,
		});

		expect(result).toBe(configuration);
		expect(interaction.options.getChannel).toHaveBeenCalledWith("channel");
		expect(SuggestionModel.create).toHaveBeenCalledWith({
			guildId: interaction.guild.id,
			channelId: channel.id,
		});
	});
});
