import { TwitchEventPipeline } from "../../../lib/twitch-event-pipeline";
import { CommandModel, ICommandDocument } from "../schemas/Command";

export const getDBCommand: TwitchEventPipeline.Command.Step<
	string,
	ICommandDocument | null
> = (name, { channel }) =>
	CommandModel.findOne({
		channel,
		name,
	}) as any;
