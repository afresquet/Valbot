import { Errors } from "../../utils/Errors";

export class DiscordErrors extends Errors {
	static CommandInteractionReplyEphemeral = class CommandInteractionReplyEphemeral extends Error {};
}
