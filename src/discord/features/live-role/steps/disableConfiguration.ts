import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";
import { LiveRoleModel } from "../schemas/LiveRole";

export const disableLiveRoleConfiguration: DiscordEventPipeline.CommandInteraction.Function<
	unknown,
	Promise<void>
> = async (_, { interaction }) => {
	await LiveRoleModel.findOneAndDelete({
		guildId: interaction.guild!.id,
	});
};
