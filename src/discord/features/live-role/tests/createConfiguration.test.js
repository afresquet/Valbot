const { createLiveRoleConfiguration } = require("../steps/createConfiguration");
const { LiveRoleModel } = require("../schemas/LiveRole");
const { Errors } = require("../../../../utils/Errors");

describe("live-role setup command createConfiguration step", () => {
	const role = { id: "roleId" };
	const interaction = {
		guild: { id: "guildId" },
	};

	test("creates a configuration for the guild", async () => {
		const configuration = { guildId: interaction.guild.id, roleId: role.id };

		jest.spyOn(LiveRoleModel, "create").mockReturnValueOnce(configuration);

		const result = await createLiveRoleConfiguration(
			role,
			{ interaction, configuration },
			{}
		);

		expect(result).toBe("Live role is now enabled on this server.");
		expect(LiveRoleModel.create).toHaveBeenCalledWith({
			guildId: interaction.guild.id,
			roleId: role.id,
		});
	});
});
