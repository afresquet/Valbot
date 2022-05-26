import { DiscordTypePipe } from "../../../lib";

export const customId =
	(...ids: string[]): DiscordTypePipe.ButtonInteraction.Function =>
	(_, { interaction }, { Errors }) => {
		if (!ids.includes(interaction.customId)) {
			throw new Errors.Exit();
		}
	};
