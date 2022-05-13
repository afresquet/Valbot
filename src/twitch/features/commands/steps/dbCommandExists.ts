import { Pipeline } from "../../../../lib/pipeline";
import { CommandModel, ICommand } from "../schemas/Command";

export const dbCommandExists: Pipeline.Step<
	ICommand,
	boolean,
	unknown,
	unknown
> = ({ channel, name }) => CommandModel.exists({ channel, name }) as any;
