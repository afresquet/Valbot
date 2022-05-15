import { DiscordEventPipeline } from "../../../../discord/lib/discord-event-pipeline";
import { CommandModel, ICommand } from "../schemas/Command";

export const deleteDBCommand: DiscordEventPipeline.Function<
	any,
	ICommand,
	Promise<void>
> = async ({ channel, name }) => {
	await CommandModel.findOneAndDelete({ channel, name });
};
