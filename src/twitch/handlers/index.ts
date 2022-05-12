import { readdir } from "fs/promises";
import { Client } from "tmi.js";

export async function setupHandlers(client: Client) {
	try {
		// Get all files from handlers folder
		const files = (
			await readdir(`${process.cwd()}/dist/twitch/handlers`)
		).filter(file => file.endsWith(".js") && file !== "index.js");

		// Import all files' default exports
		const handlers = await Promise.all(
			files.map(file =>
				import(`${process.cwd()}/dist/twitch/handlers/${file}`).then(
					module => module.default
				)
			)
		);

		// Register all handlers
		for (const handler of handlers) {
			try {
				await handler(client);
			} catch (error) {
				console.error(error);
			}
		}
	} catch (error) {
		console.error(error);
	}
}
