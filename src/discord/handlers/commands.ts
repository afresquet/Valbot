import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { readdir } from "fs/promises";
import { Command, Handler, SetupCommand } from "../types/discord";
import { isSetupCommand } from "../utils/isSetupCommand";

const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

const commandsHandler: Handler = async context => {
	try {
		// console.log("Started clearing application (/) commands...");

		// await Promise.all(
		// 	(
		// 		(await rest.get(
		// 			Routes.applicationGuildCommands(clientId, guildId)
		// 		)) as any[]
		// 	).map(async command => {
		// 		return rest.delete(
		// 			`${Routes.applicationGuildCommands(clientId, guildId)}/${command.id}`
		// 		);
		// 	})
		// );

		// console.log("Successfully cleared application (/) commands.");

		console.log("Loading Discord command handler...");

		const setupCommand = new SlashCommandBuilder()
			.setName("setup")
			.setDescription("Set bot features up.");

		// get all folders from the commands folder
		const dirents = await readdir(`${process.cwd()}/dist/discord/features`, {
			withFileTypes: true,
		});
		const directories = dirents
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);

		const commands: Array<Command | SetupCommand> = [];

		for (const directory of directories) {
			// get all files from the current folder
			const files = (
				await readdir(
					`${process.cwd()}/dist/discord/features/${directory}/commands`
				)
			).filter(file => file.endsWith(".js"));

			// import all files' default exports
			const cmds = await Promise.all<Command | SetupCommand>(
				files.map(async file => {
					const mod = await import(
						`${process.cwd()}/dist/discord/features/${directory}/commands/${file}`
					);

					return mod.default;
				})
			);

			commands.push(...cmds);
		}

		// register all commands and push them to the array
		for (const command of commands) {
			let name = command.data.name;

			if (isSetupCommand(command)) {
				setupCommand.addSubcommand(command.data);

				name = `setup-${command.data.name}`;
			}

			context.discord.commands.set(name, command);
		}

		console.log("Discord command handler loaded!");

		console.log("Started refreshing application (/) commands...");

		await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
			body: [
				...commands
					.filter(command => !isSetupCommand(command))
					.map(command => command.data.toJSON()),
				setupCommand.toJSON(),
			],
		});

		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.log("Discord command handler failed to load!");
		console.error(error);
	}
};

export default commandsHandler;
