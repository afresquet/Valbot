const {
	editSuggestionsConfiguration,
} = require("../../../../src/commands/suggestions/steps/editConfiguration");
const { SuggestionModel } = require("../../../../src/schemas/Suggestion");

describe("live-role setup command editConfiguration step", () => {
	const channel = { id: "channelId" };
	const interaction = {
		guild: { id: "guildId" },
		options: {
			getChannel: jest.fn(() => channel),
		},
	};

	test("modifies the configuration for the guild", async () => {
		jest.spyOn(SuggestionModel, "updateOne").mockReturnValueOnce();

		await editSuggestionsConfiguration(undefined, { interaction });

		expect(interaction.options.getChannel).toHaveBeenCalledWith("channel");
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
