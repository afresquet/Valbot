import { assert } from "../../../../lib/pipeline";
import TwitchEventPipelineBuilder, {
	TwitchEventPipeline,
} from "../../../lib/twitch-event-pipeline";
import { say } from "../../global/steps/say";
import { getDBCommand } from "./getDBCommand";

export const executeDBCommand: TwitchEventPipeline.Command.Step<
	string[],
	void
> = new TwitchEventPipelineBuilder.Command<string[]>()
	.pipe(getDBCommand)
	.pipe(assert())
	.pipe(dbCommand => dbCommand.message)
	.pipe(say)
	.step();
