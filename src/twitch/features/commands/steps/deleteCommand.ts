import { TwitchTypePipe } from "../../../lib";
import { ICommand } from "../schemas/Command";

export const deleteDBCommand: TwitchTypePipe.Function<
	any,
	ICommand,
	Promise<void>
> = async ({ channel, name }, _, { models: { CommandModel } }) => {
	await CommandModel.findOneAndDelete({ channel, name });
};
