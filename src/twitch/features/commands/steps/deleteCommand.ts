import { Pipeline, tap } from "../../../../lib/pipeline";
import { CommandModel, ICommand } from "../schemas/Command";

export const deleteDBCommand: Pipeline.Pipeline<
	ICommand,
	ICommand,
	unknown,
	unknown
> = tap(
	async ({ channel, name }) =>
		CommandModel.findOneAndDelete({ channel, name }) as any
);
