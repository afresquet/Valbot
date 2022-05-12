import { CommandInteraction } from "discord.js";
import { DiscordEventPipeline } from "../../../lib/custom-pipelines/discord-event/discord-event-pipeline";
import { ILiveRoleDocument, LiveRoleModel } from "../../../schemas/LiveRole";

export const createLiveRoleConfiguration: DiscordEventPipeline.Step<
	"interactionCreate",
	unknown,
	Promise<ILiveRoleDocument>
> = (_, { interaction }) => {
	const { options, guild } = interaction as CommandInteraction;

	const role = options.getRole("role");

	return LiveRoleModel.create({
		guildId: guild!.id,
		roleId: role!.id,
	});
};
