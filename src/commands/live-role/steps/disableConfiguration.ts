import { DiscordEventPipeline } from "../../../lib/custom-pipelines/discord-event/discord-event-pipeline";
import { LiveRoleModel } from "../../../schemas/LiveRole";

export const disableLiveRoleConfiguration: DiscordEventPipeline.CommandInteraction.Step<
	unknown,
	void
> = async (_, { interaction }) => {
	await LiveRoleModel.findOneAndDelete({
		guildId: interaction.guild!.id,
	});
};
