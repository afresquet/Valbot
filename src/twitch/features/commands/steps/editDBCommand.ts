import { TypePipe } from "typepipe";
import { CommandModel, ICommand, ICommandDocument } from "../schemas/Command";

export const editDBCommand: TypePipe.Function<
	ICommand,
	Promise<ICommandDocument>,
	unknown,
	unknown
> = ({ channel, name, message }) =>
	CommandModel.findOneAndUpdate({ channel, name }, { message }) as any;
