import { Pipeline } from "../../../../lib/pipeline";
import { CommandModel, ICommand, ICommandDocument } from "../schemas/Command";

export const createDBCommand: Pipeline.Step<
	ICommand,
	ICommandDocument,
	unknown,
	unknown
> = command => CommandModel.create(command);
