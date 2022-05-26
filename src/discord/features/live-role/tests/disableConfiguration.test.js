const {
	disableLiveRoleConfiguration,
} = require("../steps/disableConfiguration");

describe("live-role setup command disableConfiguration step", () => {
	const interaction = {
		guild: { id: "guildId" },
	};
	const context = {
		models: {
			LiveRoleModel: {
				findOneAndDelete: jest.fn(async () => {}),
			},
		},
	};

	test("deletes the configuration for the guild", async () => {
		const result = await disableLiveRoleConfiguration(
			undefined,
			{
				interaction,
			},
			context
		);

		expect(result).toBe("Live role was disabled.");
		expect(context.models.LiveRoleModel.findOneAndDelete).toHaveBeenCalledWith({
			guildId: interaction.guild.id,
		});
	});
});
