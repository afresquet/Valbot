import { CommandInteraction } from "discord.js";
import { DiscordEventPipeline } from "../discord-event/discord-event-pipeline";

export const interactionReplyEphemeral: DiscordEventPipeline.Step<
	"interactionCreate",
	string,
	Promise<void>
> = (content, { interaction }) => {
	return (interaction as CommandInteraction).reply({
		content,
		ephemeral: true,
	});
};
