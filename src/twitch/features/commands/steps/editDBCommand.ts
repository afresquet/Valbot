import { Pipeline } from "../../../../lib/pipeline";
import { CommandModel, ICommand, ICommandDocument } from "../schemas/Command";

export const editDBCommand: Pipeline.Pipeline<
	ICommand,
	Promise<ICommandDocument>,
	unknown,
	unknown
> = ({ channel, name, message }) =>
	CommandModel.findOneAndUpdate({ channel, name }, { message }) as any;
