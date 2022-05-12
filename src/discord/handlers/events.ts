import { Awaitable, ClientEvents } from "discord.js";
import { readdir } from "fs/promises";
import { Event, Handler } from "../types/discord";
import { createClientEventsContext } from "../utils/createClientEventsContext";

const eventsHandler: Handler = async client => {
	try {
		console.log("Loading event handler...");

		const dirents = await readdir(`${process.cwd()}/dist/discord/features`, {
			withFileTypes: true,
		});
		const directories = dirents
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);

		for (const directory of directories) {
			const files = (
				await readdir(
					`${process.cwd()}/dist/discord/features/${directory}/events`
				)
			).filter(file => file.endsWith(".js"));

			for (const file of files) {
				try {
					// we need to pass a generic type here for TypeScript to be happy, doesn't affect the code
					type T = "interactionCreate";

					const event: Event<T> = (
						await import(
							`${process.cwd()}/dist/discord/features/${directory}/events/${file}`
						)
					).default;

					const callback: (
						...args: ClientEvents[T]
					) => Awaitable<void> = async (...args) => {
						try {
							const context = createClientEventsContext<T>(
								event.event,
								...args
							);
							await event.execute(context);
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
