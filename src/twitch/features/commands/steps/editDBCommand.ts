import { Pipeline } from "../../../../lib/pipeline";
import { CommandModel, ICommand, ICommandDocument } from "../schemas/Command";

export const editDBCommand: Pipeline.Step<
	ICommand,
	ICommandDocument,
	unknown,
	unknown
> = ({ channel, name, message }) =>
	CommandModel.findOneAndUpdate({ channel, name }, { message }) as any;
