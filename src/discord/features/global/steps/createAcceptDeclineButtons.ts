import { MessageActionRow, MessageButton } from "discord.js";
import { Pipeline } from "../../../../lib/pipeline";

export const createAcceptDeclineButtons =
	<T, C>(customId: string): Pipeline.Step<T, MessageActionRow, C> =>
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
