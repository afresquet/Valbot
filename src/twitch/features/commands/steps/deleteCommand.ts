import { TwitchEventPipeline } from "../../../lib";
import { CommandModel, ICommand } from "../schemas/Command";

export const deleteDBCommand: TwitchEventPipeline.Function<
	any,
	ICommand,
	Promise<void>
> = async ({ channel, name }) => {
	await CommandModel.findOneAndDelete({ channel, name });
};
