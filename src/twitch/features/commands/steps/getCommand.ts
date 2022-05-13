import { TwitchEventPipeline } from "../../../lib/twitch-event-pipeline";
import { CommandModel, ICommandDocument } from "../schemas/Command";

export const getCommand: TwitchEventPipeline.Command.Step<
	string,
	ICommandDocument | null
> = (name, { channel }) => {
	return CommandModel.findOne({
		channel,
		name,
	}) as any;
};
