const {
	editLiveRoleConfiguration,
} = require("../../../../src/commands/live-role/steps/editConfiguration");
const { LiveRoleModel } = require("../../../../src/schemas/LiveRole");

describe("live-role setup command editConfiguration step", () => {
	const role = { id: "roleId" };
	const interaction = {
		guild: { id: "guildId" },
		options: {
			getRole: jest.fn(() => role),
		},
	};

	test("modifies the configuration for the guild", async () => {
		jest.spyOn(LiveRoleModel, "updateOne").mockReturnValueOnce();

		await editLiveRoleConfiguration(undefined, { interaction });

		expect(interaction.options.getRole).toHaveBeenCalledWith("role");
		expect(LiveRoleModel.updateOne).toHaveBeenCalledWith(
			{
				guildId: interaction.guild.id,
			},
			{
				roleId: role.id,
			}
		);
	});
});
