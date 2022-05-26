import { TwitchTypePipe } from "../../../lib";
import { ICommand } from "../schemas/Command";

export const dbCommandExists: TwitchTypePipe.Command.Function<
	ICommand,
	Promise<boolean>
> = ({ channel, name }, _, { models: { CommandModel } }) =>
	CommandModel.exists({ channel, name }) as any;
