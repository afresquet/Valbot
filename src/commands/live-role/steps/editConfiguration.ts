import { CommandInteraction } from "discord.js";
import { DiscordEventPipeline } from "../../../lib/custom-pipelines/discord-event/discord-event-pipeline";
import { LiveRoleModel } from "../../../schemas/LiveRole";

export const editLiveRoleConfiguration: DiscordEventPipeline.Step<
	"interactionCreate",
	unknown,
	Promise<void>
> = async (_, { interaction }) => {
	const { options, guild } = interaction as CommandInteraction;

	const role = options.getRole("role");

	await LiveRoleModel.updateOne({ guildId: guild!.id }, { roleId: role!.id });
};
