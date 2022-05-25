import { MessageActionRow, MessageButton } from "discord.js";
import { DiscordTypePipe } from "../../../lib";
import { ClientEventsContext } from "../../../types/discord";

export const createAcceptDeclineButtons =
	<Event extends keyof ClientEventsContext, Value>(
		customId: string
	): DiscordTypePipe.Function<Event, Value, MessageActionRow> =>
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
