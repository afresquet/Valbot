import { MessageActionRow, MessageButton } from "discord.js";
import { DiscordEventPipeline } from "../../../lib/discord-event-pipeline";
import { ClientEventsContext } from "../../../types/discord";

export const createAcceptDeclineButtons =
	<Event extends keyof ClientEventsContext, Value>(
		customId: string
	): DiscordEventPipeline.Pipeline<Event, Value, MessageActionRow> =>
	() => {
		const buttons = new MessageActionRow();

		buttons.addComponents(
			new MessageButton()
				.setCustomId(`${customId}-accept`)
				.setLabel("✅ Accept")
				.setStyle("PRIMARY"),
			new MessageButton()
				.setCustomId(`${customId}-decline`)
				.setLabel("⛔ Decline")
				.setStyle("PRIMARY")
		);

		return buttons;
	};
