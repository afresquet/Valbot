const { createLiveRoleConfiguration } = require("../steps/createConfiguration");
const { Errors } = require("../../../../utils/Errors");

describe("live-role setup command createConfiguration step", () => {
	const role = { id: "roleId" };
	const interaction = {
		guild: { id: "guildId" },
	};
	const configuration = { guildId: interaction.guild.id, roleId: role.id };
	const context = {
		models: {
			LiveRoleModel: {
				create: jest.fn(async () => configuration),
			},
		},
	};

	test("creates a configuration for the guild", async () => {
		const result = await createLiveRoleConfiguration(
			role,
			{ interaction, configuration },
			context
		);

		expect(result).toBe("Live role is now enabled on this server.");
		expect(context.models.LiveRoleModel.create).toHaveBeenCalledWith({
			guildId: interaction.guild.id,
			roleId: role.id,
		});
	});
});
