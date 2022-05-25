import { TwitchEventPipeline } from "../../../lib";
import { CommandModel, ICommand } from "../schemas/Command";

export const dbCommandExists: TwitchEventPipeline.Command.Function<
	ICommand,
	Promise<boolean>
> = ({ channel, name }) => CommandModel.exists({ channel, name }) as any;
