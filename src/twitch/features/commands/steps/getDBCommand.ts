import { TwitchTypePipe } from "../../../lib";
import { ICommandDocument } from "../schemas/Command";

export const getDBCommand: TwitchTypePipe.Command.Function<
	string,
	Promise<ICommandDocument | null>
> = (name, { channel }, { models: { CommandModel } }) =>
	CommandModel.findOne({
		channel,
		name,
	}) as any;
