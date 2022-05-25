const { editLiveRoleConfiguration } = require("../steps/editConfiguration");
const { LiveRoleModel } = require("../schemas/LiveRole");

describe("live-role setup command editConfiguration step", () => {
	const role = { id: "roleId" };
	const interaction = {
		guild: { id: "guildId" },
	};

	test("modifies the configuration for the guild", async () => {
		jest.spyOn(LiveRoleModel, "updateOne").mockReturnValueOnce();

		const result = await editLiveRoleConfiguration(role, { interaction });

		expect(result).toBe("Live role was edited.");
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
