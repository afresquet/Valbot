import { tap } from "../../../../lib/pipeline";
import { CommandModel, ICommand } from "../schemas/Command";

export const deleteDBCommand = tap<Promise<ICommand>, unknown, unknown>(
	async ({ channel, name }) =>
		CommandModel.findOneAndDelete({ channel, name }) as any
);
