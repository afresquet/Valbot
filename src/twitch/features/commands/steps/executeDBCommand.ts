import { assert } from "../../../../lib/pipeline";
import TwitchEventPipelineBuilder, {
	TwitchEventPipeline,
} from "../../../lib/twitch-event-pipeline";
import { TwitchErrors } from "../../../utils/TwitchErrors";
import { say } from "../../global/steps/say";
import { getDBCommand } from "./getDBCommand";

export const executeDBCommand: TwitchEventPipeline.Command.Pipeline<
	string[],
	void
> = new TwitchEventPipelineBuilder.Command<string[]>()
	.pipe(([name]) => name)
	.pipe(getDBCommand)
	.pipe(assert(() => new TwitchErrors.Exit()))
	.pipe(dbCommand => dbCommand.message)
	.pipe(say)
	.pipeline();
