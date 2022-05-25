import { TwitchEventPipeline } from "../../../lib";
import { CommandModel, ICommandDocument } from "../schemas/Command";

export const getDBCommand: TwitchEventPipeline.Command.Function<
	string,
	Promise<ICommandDocument | null>
> = (name, { channel }) =>
	CommandModel.findOne({
		channel,
		name,
	}) as any;
