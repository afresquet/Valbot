import { readdir } from "fs/promises";
import { Command, Handler } from "../types/discord";

const commandsHandler: Handler = async client => {
	try {
		console.log("Loading command handler...");

		// get all folders from the commands folder
		const dirents = await readdir(`${process.cwd()}/dist/commands`, {
			withFileTypes: true,
		});
		const directories = dirents
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);

		for (const directory of directories) {
			// get all files from the current folder
			const files = (
				await readdir(`${process.cwd()}/dist/commands/${directory}`)
			).filter(file => file.endsWith(".js"));

			// import all files' default exports
			const commands = await Promise.all<Command>(
				files.map(async file => {
					const mod = await import(
						`${process.cwd()}/dist/commands/${directory}/${file}`
					);

					return mod.default;
				})
			);

			// register all commands and push them to the array
			for (const command of commands) {
				client.commands.set(command.data.name, command);

				console.log(`Loaded command "${command.data.name}"`);
			}
		}

		console.log("Command handler loaded!");
	} catch (error) {
		console.error(error);
	}
};

export default commandsHandler;
