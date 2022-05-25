import { CacheType, CommandInteractionOptionResolver } from "discord.js";
import { DiscordTypePipe } from "../../../lib";

export const getOptions =
	<Value, Result>(
		callback: (
			options: Omit<
				CommandInteractionOptionResolver<CacheType>,
				"getMessage" | "getFocused"
			>
		) => Result
	): DiscordTypePipe.CommandInteraction.Function<Value, Result> =>
	(_, { interaction }) => {
		return callback(interaction.options);
	};
