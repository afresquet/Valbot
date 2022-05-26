import { DiscordTypePipe } from "../../../lib";
import { ILiveRoleDocument } from "../schemas/LiveRole";

export const getLiveRoleConfiguration: DiscordTypePipe.CommandInteraction.Function<
	unknown,
	Promise<
		DiscordTypePipe.CommandInteraction.Event & {
			configuration: ILiveRoleDocument | null;
		}
	>
> = async (_, { interaction, ...context }, { models: { LiveRoleModel } }) => ({
	...context,
	interaction,
	configuration: await LiveRoleModel.findByGuild(interaction.guild!),
});
