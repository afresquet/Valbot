const {
	getLiveRoleConfiguration,
} = require("../../../../src/commands/live-role/steps/getConfiguration");
const { LiveRoleModel } = require("../../../../src/schemas/LiveRole");

describe("live-role setup command getConfiguration step", () => {
	const context = {
		interaction: {
			guild: { id: "guildId" },
		},
	};

	test("returns the value of the guild's configuration", async () => {
		const value = "value";

		jest.spyOn(LiveRoleModel, "findByGuild").mockReturnValueOnce(value);

		const result = await getLiveRoleConfiguration(undefined, context);

		expect(result).toBe(value);
		expect(LiveRoleModel.findByGuild).toHaveBeenCalledWith(
			context.interaction.guild
		);
	});
});
