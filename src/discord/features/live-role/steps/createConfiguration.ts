import { Role } from "discord.js";
import { DiscordTypePipe } from "../../../lib";
import { LiveRoleModel } from "../schemas/LiveRole";

export const createLiveRoleConfiguration: DiscordTypePipe.CommandInteraction.Function<
	Role | null,
	Promise<string>
> = async (role, { interaction }, { Errors }) => {
	if (!role) {
		throw new Errors.Exit();
	}

	await LiveRoleModel.create({
		guildId: interaction.guild!.id,
		roleId: role.id,
	});

	return "Live role is now enabled on this server.";
};
