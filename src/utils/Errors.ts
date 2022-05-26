import { InteractionReplyOptions } from "discord.js";

export class Errors {
	static Exit = class Exit extends Error {};

	static InteractionReply = class InteractionReply extends Error {
		constructor(public content: InteractionReplyOptions) {
			super();
		}
	};

	static InteractionReplyEphemeral = class InteractionReplyEphemeral extends Error {
		constructor(public content: InteractionReplyOptions) {
			super();
		}
	};
}
