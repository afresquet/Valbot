const {
	createLiveRoleConfiguration,
} = require("../../../../src/commands/live-role/steps/createConfiguration");
const { LiveRoleModel } = require("../../../../src/schemas/LiveRole");

describe("live-role setup command createConfiguration step", () => {
	const role = { id: "roleId" };
	const interaction = {
		guild: { id: "guildId" },
		options: {
			getRole: jest.fn(() => role),
		},
	};

	test("creates a configuration for the guild", async () => {
		const configuration = { guildId: interaction.guild.id, roleId: role.id };

		jest.spyOn(LiveRoleModel, "create").mockReturnValueOnce(configuration);

		const result = await createLiveRoleConfiguration(undefined, interaction);

		expect(result).toBe(configuration);
		expect(interaction.options.getRole).toHaveBeenCalledWith("role");
		expect(LiveRoleModel.create).toHaveBeenCalledWith({
			guildId: interaction.guild.id,
			roleId: role.id,
		});
	});
});
