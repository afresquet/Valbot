import { Context } from "../../types/Context";
import { DiscordEventPipeline } from "../lib/discord-event-pipeline";
import { ClientEventsContext } from "../types/discord";
import { DiscordErrors } from "./DiscordErrors";

export const errorHandler: <
	E extends Error,
	Event extends keyof ClientEventsContext
>(
	error: E,
	event: ClientEventsContext[Event],
	context: Context
) => Promise<void> = async (error, event) => {
	if (error instanceof DiscordErrors.Exit) return;

	if (error instanceof DiscordErrors.CommandInteractionReplyEphemeral) {
		const { interaction } =
			event as DiscordEventPipeline.CommandInteraction.Event;

		await interaction.reply({
			content: error.message,
			ephemeral: true,
		});

		return;
	}

	console.error(error, event);
};
