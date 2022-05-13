import { existsSync } from "fs";
import { readdir } from "fs/promises";
import { Events } from "tmi.js";
import { Event, Handler } from "../types/twitch";
import { createClientEventsContext } from "../utils/createClientEventsContext";

const eventsHandler: Handler = async context => {
	try {
		console.log("Loading event handler...");

		const dirents = await readdir(`${process.cwd()}/dist/twitch/features`, {
			withFileTypes: true,
		});
		const directories = dirents
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);

		for (const directory of directories) {
			const dir = `${process.cwd()}/dist/twitch/features/${directory}/events`;

			if (!existsSync(dir)) continue;

			const files = (await readdir(dir)).filter(file => file.endsWith(".js"));

			for (const file of files) {
				try {
					// we need to pass a generic type here for TypeScript to be happy, doesn't affect the code
					type T = "message";

					const event: Event<T> = (
						await import(
							`${process.cwd()}/dist/twitch/features/${directory}/events/${file}`
						)
					).default;

					const callback: Events[T] = async (...args) => {
						try {
							const eventContext = createClientEventsContext<T>(
								event.event,
								...args
							);

							await event.execute(eventContext, eventContext, context);
						} catch (error) {
							console.error(error);
						}
					};

					if (event.once) {
						context.twitch.once(event.event as keyof Events, callback);
					} else {
						context.twitch.on(event.event as keyof Events, callback);
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
