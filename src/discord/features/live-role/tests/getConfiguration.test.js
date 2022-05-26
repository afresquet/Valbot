const { getLiveRoleConfiguration } = require("../steps/getConfiguration");

describe("live-role setup command getConfiguration step", () => {
	const value = { foo: "bar" };

	const event = {
		interaction: {
			guild: { id: "guildId" },
		},
	};
	const context = {
		models: {
			LiveRoleModel: {
				findByGuild: jest.fn(async () => value),
			},
		},
	};

	test("returns the value of the guild's configuration", async () => {
		const result = await getLiveRoleConfiguration(undefined, event, context);

		expect(result).toStrictEqual({
			...event,
			configuration: value,
		});
		expect(context.models.LiveRoleModel.findByGuild).toHaveBeenCalledWith(
			event.interaction.guild
		);
	});
});
