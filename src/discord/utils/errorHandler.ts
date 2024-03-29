import { Context } from "../../types/Context";
import { DiscordTypePipe } from "../lib";
import { ClientEventsContext } from "../types/discord";

export const errorHandler: <
	E extends Error,
	Event extends keyof ClientEventsContext
>(
	error: E,
	event: ClientEventsContext[Event],
	context: Context
) => Promise<void> = async (error, event, { Errors }) => {
	if (error instanceof Errors.Exit) return;

	if (
		error instanceof Errors.InteractionReply ||
		error instanceof Errors.InteractionReplyEphemeral
	) {
		const { interaction } = event as DiscordTypePipe.CommandInteraction.Event;

		await interaction.reply({
			...error.content,
			ephemeral:
				error instanceof Errors.InteractionReplyEphemeral ||
				error.content.ephemeral,
		});

		return;
	}

	console.error(error, event);
};
