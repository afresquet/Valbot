import { Role } from "discord.js";
import { DiscordTypePipe } from "../../../lib";
import { LiveRoleModel } from "../schemas/LiveRole";

export const editLiveRoleConfiguration: DiscordTypePipe.CommandInteraction.Function<
	Role | null,
	Promise<string>
> = async (role, { interaction }, { Errors }) => {
	if (!role) {
		throw new Errors.Exit();
	}

	await LiveRoleModel.updateOne(
		{ guildId: interaction.guild!.id },
		{ roleId: role.id }
	);

	return "Live role was edited.";
};
