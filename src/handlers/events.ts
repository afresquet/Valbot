import { readdir } from "fs/promises";
import { Event, Handler } from "../types/discord";

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
					// we need to pass a generic type here, but it doesn't matter for the following code
					const event: Event<"messageCreate"> = (
						await import(`${process.cwd()}/dist/events/${directory}/${file}`)
					).default;

					const callback: typeof event.execute = async (...args) => {
						try {
							await event.execute(...args);
						} catch (error) {
							console.error(error);
						}
					};

					if (event.once) {
						client.once(event.event, callback);
					} else {
						client.on(event.event, callback);
					}

					console.log(`Loaded event "${event.name}"`);
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
