const liveRoleSetupCommand =
	require("../../../src/commands/live-role/setup").default;
const { LiveRoleModel } = require("../../../src/schemas/LiveRole");

describe("live-role setup command", () => {
	const interaction = {
		guild: { id: "guildId" },
		options: {
			getSubcommand: jest.fn(),
			getRole: jest.fn(),
		},
		reply: jest.fn(),
	};

	const role = { id: "roleId" };

	beforeEach(() => {
		jest.clearAllMocks();
		interaction.options.getRole.mockReturnValue(role);
	});

	test("searches for the configuration with the given guild", async () => {
		jest.spyOn(LiveRoleModel, "findByGuild").mockReturnValueOnce();

		await liveRoleSetupCommand.execute(interaction);

		expect(LiveRoleModel.findByGuild).toHaveBeenCalledWith(interaction.guild);
	});

	describe("enable", () => {
		beforeEach(() => {
			interaction.options.getSubcommand.mockReturnValue("enable");
		});

		test("enables the feature on the server", async () => {
			jest.spyOn(LiveRoleModel, "findByGuild").mockReturnValueOnce();
			jest.spyOn(LiveRoleModel, "create").mockReturnValueOnce();

			await liveRoleSetupCommand.execute(interaction);

			expect(LiveRoleModel.create).toHaveBeenCalledWith({
				guildId: interaction.guild.id,
				roleId: role.id,
			});
			expect(interaction.reply).toHaveBeenCalledWith({
				content: "Live role is now enabled on this server.",
				ephemeral: true,
			});
		});

		test("ignores if it's already enabled", async () => {
			jest
				.spyOn(LiveRoleModel, "findByGuild")
				.mockReturnValueOnce({ enabled: true });

			await liveRoleSetupCommand.execute(interaction);

			expect(interaction.reply).toHaveBeenCalledWith({
				content: "Live role is already enabled on this server.",
				ephemeral: true,
			});
		});
	});

	describe("edit", () => {
		beforeEach(() => {
			interaction.options.getSubcommand.mockReturnValue("edit");
		});

		test("enables the feature on the server", async () => {
			jest
				.spyOn(LiveRoleModel, "findByGuild")
				.mockReturnValueOnce({ enabled: true });
			jest.spyOn(LiveRoleModel, "updateOne").mockReturnValueOnce();

			await liveRoleSetupCommand.execute(interaction);

			expect(LiveRoleModel.updateOne).toHaveBeenCalledWith(
				{
					guildId: interaction.guild.id,
				},
				{
					roleId: role.id,
				}
			);
			expect(interaction.reply).toHaveBeenCalledWith({
				content: "Live role was edited.",
				ephemeral: true,
			});
		});

		test("fails if its not setup beforehand", async () => {
			jest.spyOn(LiveRoleModel, "findByGuild").mockReturnValueOnce();

			await liveRoleSetupCommand.execute(interaction);

			expect(interaction.reply).toHaveBeenCalledWith({
				content: "Live role is not enabled on this server.",
				ephemeral: true,
			});
		});
	});

	describe("disable", () => {
		beforeEach(() => {
			interaction.options.getSubcommand.mockReturnValue("disable");
		});

		test("disables the feature on the server", async () => {
			jest
				.spyOn(LiveRoleModel, "findByGuild")
				.mockReturnValueOnce({ enabled: true });
			jest.spyOn(LiveRoleModel, "findOneAndDelete").mockReturnValueOnce();

			await liveRoleSetupCommand.execute(interaction);

			expect(LiveRoleModel.findOneAndDelete).toHaveBeenCalledWith({
				guildId: interaction.guild.id,
			});
			expect(interaction.reply).toHaveBeenCalledWith({
				content: "Live role was disabled.",
				ephemeral: true,
			});
		});

		test("fails if its not setup beforehand", async () => {
			jest.spyOn(LiveRoleModel, "findByGuild").mockReturnValueOnce();

			await liveRoleSetupCommand.execute(interaction);

			expect(interaction.reply).toHaveBeenCalledWith({
				content: "Live role is not enabled on this server.",
				ephemeral: true,
			});
		});
	});
});
