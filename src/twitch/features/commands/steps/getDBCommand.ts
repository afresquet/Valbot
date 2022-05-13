import { TwitchEventPipeline } from "../../../lib/twitch-event-pipeline";
import { CommandModel, ICommand, ICommandDocument } from "../schemas/Command";

export const getDBCommand: TwitchEventPipeline.Command.Step<
	ICommand,
	ICommandDocument | null
> = ({ name }, { channel }) =>
	CommandModel.findOne({
		channel,
		name,
	}) as any;
