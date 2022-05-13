import { existsSync } from "fs";
import { readdir } from "fs/promises";
import { Command, Handler } from "../types/twitch";

const commandsHandler: Handler = async ({ twitch }) => {
	try {
		console.log("Loading Twitch command handler...");

		// get all folders from the commands folder
		const dirents = await readdir(`${process.cwd()}/dist/twitch/features`, {
			withFileTypes: true,
		});
		const directories = dirents
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);

		for (const directory of directories) {
			const dir = `${process.cwd()}/dist/twitch/features/${directory}/commands`;

			if (!existsSync(dir)) continue;

			// get all files from the current folder
			const files = (await readdir(dir)).filter(file => file.endsWith(".js"));

			// import all files' default exports
			const commands = await Promise.all<Command>(
				files.map(async file => {
					const mod = await import(
						`${process.cwd()}/dist/twitch/features/${directory}/commands/${file}`
					);

					return mod.default;
				})
			);

			// register all commands and push them to the array
			for (const command of commands) {
				const name = command.subcommand
					? `${command.name}-${command.subcommand}`
					: command.name;

				twitch.commands.set(name, command);
			}
		}

		console.log("Twitch command handler loaded!");
	} catch (error) {
		console.log("Twitch command handler failed to load!");
		console.error(error);
	}
};

export default commandsHandler;
