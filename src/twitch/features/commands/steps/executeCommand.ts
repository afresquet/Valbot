import { TwitchEventPipeline } from "../../../lib/twitch-event-pipeline";

export const executeCommand: TwitchEventPipeline.Command.Step<
	string,
	void
> = async (name, event, context) => {
	const command = context.twitch.commands.get(name);

	if (!command) {
		throw new Error("ExitError");
	}

	await command.execute(event, event, context);
};
