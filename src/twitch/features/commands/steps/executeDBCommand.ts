import TwitchPipeline, { TwitchEventPipeline } from "../../../lib";
import { TwitchErrors } from "../../../utils/TwitchErrors";
import { say } from "../../global/steps/say";
import { getDBCommand } from "./getDBCommand";

export const executeDBCommand: TwitchEventPipeline.Command.Function<
	string[],
	Promise<void>
> = new TwitchPipeline.Command<string[]>()
	.pipe(([name]) => name)
	.pipe(getDBCommand)
	.assert(() => new TwitchErrors.Exit())
	.pipe(dbCommand => dbCommand.message)
	.pipe(say)
	.compose();
