import { SlashCommandBuilder } from "@discordjs/builders";
import { LiveRoleModel } from "../../schemas/LiveRole";
import { Command } from "../../types/discord";

const liveRoleSetupCommand: Command = {
	data: new SlashCommandBuilder()
		.setName("setup-live-role")
		.setDescription("Setup a live role when your members that go live")
		.addSubcommand(subcommand =>
			subcommand
				.setName("enable")
				.setDescription("Enable live role")
				.addRoleOption(option =>
					option
						.setName("role")
						.setDescription("Role to enable")
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("edit")
				.setDescription("Edit live role")
				.addRoleOption(option =>
					option
						.setName("role")
						.setDescription("Role to edit")
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand.setName("disable").setDescription("Disable live role")
		),
	execute: async interaction => {
		const { options, guild } = interaction;

		const subcommand = options.getSubcommand();
		const role = options.getRole("role");

		const configuration = await LiveRoleModel.findByGuild(guild!);

		switch (subcommand) {
			case "enable":
				{
					if (configuration) {
						interaction.reply({
							content: "Live role is already enabled on this server.",
							ephemeral: true,
						});

						return;
					}

					await LiveRoleModel.create({
						guildId: guild!.id,
						roleId: role!.id,
					});

					await interaction.reply({
						content: "Live role is now enabled on this server.",
						ephemeral: true,
					});
				}

				break;

			case "edit":
				{
					if (!configuration) {
						await interaction.reply({
							content: "Live role is not enabled on this server.",
							ephemeral: true,
						});

						return;
					}

					await LiveRoleModel.updateOne(
						{ guildId: guild!.id },
						{ roleId: role!.id }
					);

					await interaction.reply({
						content: "Live role was edited.",
						ephemeral: true,
					});
				}
				break;

			case "disable":
				{
					if (!configuration) {
						await interaction.reply({
							content: "Live role is not enabled on this server.",
							ephemeral: true,
						});

						return;
					}

					await LiveRoleModel.findOneAndDelete({ guildId: guild!.id });

					await interaction.reply({
						content: "Live role was disabled.",
						ephemeral: true,
					});
				}
				break;
		}
	},
};

export default liveRoleSetupCommand;