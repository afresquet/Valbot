import { tap } from "typepipe/dist/steps";
import { CommandModel, ICommand } from "../schemas/Command";

export const deleteDBCommand = tap<ICommand, Promise<void>, unknown, unknown>(
	async ({ channel, name }) =>
		CommandModel.findOneAndDelete({ channel, name }) as any
);
