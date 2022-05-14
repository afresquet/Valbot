import { tap } from "../../../../lib/pipeline";
import { CommandModel, ICommand } from "../schemas/Command";

export const deleteDBCommand = tap<ICommand, Promise<void>, unknown, unknown>(
	async ({ channel, name }) =>
		CommandModel.findOneAndDelete({ channel, name }) as any
);
