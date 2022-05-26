import { TwitchTypePipe } from "../../../lib/twitch-pipeline";
import { ICommand, ICommandDocument } from "../schemas/Command";

export const editDBCommand: TwitchTypePipe.Function<
	any,
	ICommand,
	Promise<ICommandDocument>
> = ({ channel, name, message }, _, { models: { CommandModel } }) =>
	CommandModel.findOneAndUpdate({ channel, name }, { message }) as any;
