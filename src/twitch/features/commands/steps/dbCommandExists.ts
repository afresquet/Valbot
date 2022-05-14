import { TwitchEventPipeline } from "../../../lib/twitch-event-pipeline";
import { CommandModel, ICommand } from "../schemas/Command";

export const dbCommandExists: TwitchEventPipeline.Command.Pipeline<
	ICommand,
	boolean
> = ({ channel, name }) => CommandModel.exists({ channel, name }) as any;
