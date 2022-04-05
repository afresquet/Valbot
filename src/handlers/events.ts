import { readdir } from "fs/promises";
import { Handler } from "../types/discord";

const eventsHandler: Handler = async client => {
	try {
		console.log("Loading event handler...");

		const dirents = await readdir(`${process.cwd()}/dist/events`, {
			withFileTypes: true,
		});
		const directories = dirents
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);

		for (const directory of directories) {
			const files = (
				await readdir(`${process.cwd()}/dist/events/${directory}`)
			).filter(file => file.endsWith(".js"));

			for (const file of files) {
				try {
					const event = await import(
						`${process.cwd()}/dist/events/${directory}/${file}`
					);
					const eventName = file.split(".")[0];
					const eventHandler = event.default;

					client.on(eventName, eventHandler(client));

					console.log(`Loaded event "${eventName}"`);
				} catch (error) {
					console.error(error);
				}
			}
		}

		console.log("Event handler loaded!");
	} catch (error) {
		console.error(error);
	}
};

export default eventsHandler;
