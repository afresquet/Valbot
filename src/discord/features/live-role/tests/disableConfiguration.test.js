const {
	disableLiveRoleConfiguration,
} = require("../steps/disableConfiguration");
const { LiveRoleModel } = require("../schemas/LiveRole");

describe("live-role setup command disableConfiguration step", () => {
	const interaction = {
		guild: { id: "guildId" },
	};

	test("deletes the configuration for the guild", async () => {
		jest.spyOn(LiveRoleModel, "findOneAndDelete").mockReturnValueOnce();

		await disableLiveRoleConfiguration(undefined, { interaction });

		expect(LiveRoleModel.findOneAndDelete).toHaveBeenCalledWith({
			guildId: interaction.guild.id,
		});
	});
});