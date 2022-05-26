import { CommandInteraction, MessageEmbed } from "discord.js";
import DiscordPipeline from "../../../lib";
import { Event } from "../../../types/discord";
import { interactionType } from "../steps/interactionType";

const getCommandName = (interaction: CommandInteraction): string =>
	interaction.commandName === "setup"
		? `setup-${interaction.options.getSubcommand(true)}`
		: interaction.commandName;

const commandEvent: Event<"interactionCreate"> = {
	name: "command",
	event: "interactionCreate",
	execute: new DiscordPipeline<"interactionCreate">()
		.context(interactionType.COMMAND)
		.pipe((_, { interaction }) => getCommandName(interaction))
		.pipe((name, { interaction }) => interaction.client.commands.get(name))
		.assert((_, { interaction }, { Errors }) => {
			interaction.client.commands.delete(getCommandName(interaction));

			return new Errors.InteractionReplyEphemeral({
				embeds: [
					new MessageEmbed()
						.setColor("RED")
						.setDescription(
							"The command doesn't exist, try reloading your Discord client."
						),
				],
			});
		})
		.tap(async (command, event, context) => {
			await command.execute(event, event, context);
		})
		.compose(),
};

export default commandEvent;
