import { DiscordTypePipe } from "../../../lib";
import { ILiveRoleDocument, LiveRoleModel } from "../schemas/LiveRole";

export const getLiveRoleConfiguration: DiscordTypePipe.CommandInteraction.Function<
	unknown,
	Promise<ILiveRoleDocument | null>
> = (_, { interaction }) => LiveRoleModel.findByGuild(interaction.guild!);
