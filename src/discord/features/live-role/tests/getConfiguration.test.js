const { getLiveRoleConfiguration } = require("../steps/getConfiguration");
const { LiveRoleModel } = require("../schemas/LiveRole");

describe("live-role setup command getConfiguration step", () => {
	const context = {
		interaction: {
			guild: { id: "guildId" },
		},
	};

	test("returns the value of the guild's configuration", async () => {
		const value = { foo: "bar" };

		jest.spyOn(LiveRoleModel, "findByGuild").mockReturnValueOnce(value);

		const result = await getLiveRoleConfiguration(undefined, context);

		expect(result).toStrictEqual({
			...context,
			configuration: value,
		});
		expect(LiveRoleModel.findByGuild).toHaveBeenCalledWith(
			context.interaction.guild
		);
	});
});
