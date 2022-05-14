import { TwitchEventPipeline } from "../../../lib/twitch-event-pipeline";
import { CommandModel, ICommandDocument } from "../schemas/Command";

export const getDBCommand: TwitchEventPipeline.Command.Fn<
	string,
	Promise<ICommandDocument | null>
> = (name, { channel }) =>
	CommandModel.findOne({
		channel,
		name,
	}) as any;
