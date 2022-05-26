import { DiscordTypePipe } from "../../../lib";

const step =
	<Result>(
		callback: DiscordTypePipe.Function<"interactionCreate", unknown, Result>
	): DiscordTypePipe.Function<"interactionCreate", unknown, Result> =>
	(value, event, context) => {
		return callback(value, event, context);
	};

export const interactionType = {
	BUTTON: step((_, { interaction, ...context }, { Errors }) => {
		if (!interaction.isButton()) {
			throw new Errors.Exit();
		}

		return { ...context, interaction };
	}),
	COMMAND: step((_, { interaction, ...context }, { Errors }) => {
		if (!interaction.isCommand()) {
			throw new Errors.Exit();
		}

		return { ...context, interaction };
	}),
};
