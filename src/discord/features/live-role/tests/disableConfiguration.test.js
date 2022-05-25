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

		const result = await disableLiveRoleConfiguration(undefined, {
			interaction,
		});

		expect(result).toBe("Live role was disabled.");
		expect(LiveRoleModel.findOneAndDelete).toHaveBeenCalledWith({
			guildId: interaction.guild.id,
		});
	});
});
