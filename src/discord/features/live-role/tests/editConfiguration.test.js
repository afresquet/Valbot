const { editLiveRoleConfiguration } = require("../steps/editConfiguration");

describe("live-role setup command editConfiguration step", () => {
	const role = { id: "roleId" };
	const interaction = {
		guild: { id: "guildId" },
	};
	const context = {
		models: {
			LiveRoleModel: {
				updateOne: jest.fn(async () => {}),
			},
		},
	};

	test("modifies the configuration for the guild", async () => {
		const result = await editLiveRoleConfiguration(
			role,
			{ interaction },
			context
		);

		expect(result).toBe("Live role was edited.");
		expect(context.models.LiveRoleModel.updateOne).toHaveBeenCalledWith(
			{
				guildId: interaction.guild.id,
			},
			{
				roleId: role.id,
			}
		);
	});
});
