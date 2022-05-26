const {
	createSuggestionsConfiguration,
} = require("../steps/createConfiguration");

describe("live-role setup command createConfiguration step", () => {
	const channel = { id: "channelId" };
	const interaction = {
		guild: { id: "guildId" },
	};
	const configuration = { guildId: interaction.guild.id, roleId: channel.id };
	const context = {
		models: {
			SuggestionModel: {
				create: jest.fn(async () => configuration),
			},
		},
	};

	test("creates a configuration for the guild", async () => {
		const result = await createSuggestionsConfiguration(
			channel,
			{ interaction },
			context
		);

		expect(result).toBe("Suggestions are now enabled on this server.");
		expect(context.models.SuggestionModel.create).toHaveBeenCalledWith({
			guildId: interaction.guild.id,
			channelId: channel.id,
		});
	});
});
