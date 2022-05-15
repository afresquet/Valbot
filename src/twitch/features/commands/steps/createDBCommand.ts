import { TypePipe } from "typepipe";
import { CommandModel, ICommand, ICommandDocument } from "../schemas/Command";

export const createDBCommand: TypePipe.Function<
	ICommand,
	Promise<ICommandDocument>,
	unknown,
	unknown
> = command => CommandModel.create(command);
