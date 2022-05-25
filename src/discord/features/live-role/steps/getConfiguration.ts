import { DiscordTypePipe } from "../../../lib";
import { ILiveRoleDocument, LiveRoleModel } from "../schemas/LiveRole";

export const getLiveRoleConfiguration: DiscordTypePipe.CommandInteraction.Function<
	unknown,
	Promise<
		DiscordTypePipe.CommandInteraction.Event & {
			configuration: ILiveRoleDocument | null;
		}
	>
> = async (_, { interaction, ...context }) => ({
	...context,
	interaction,
	configuration: await LiveRoleModel.findByGuild(interaction.guild!),
});
