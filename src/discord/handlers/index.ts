import { readdir } from "fs/promises";
import { Context } from "../../types/Context";
import { Handler } from "../types/discord";

export async function setupHandlers(context: Context) {
	try {
		// Get all files from handlers folder
		const files = (
			await readdir(`${process.cwd()}/dist/discord/handlers`)
		).filter(file => file.endsWith(".js") && file !== "index.js");

		// Import all files' default exports
		const handlers = await Promise.all<Handler>(
			files.map(file =>
				import(`${process.cwd()}/dist/discord/handlers/${file}`).then(
					module => module.default
				)
			)
		);

		// Register all handlers
		for (const handler of handlers) {
			try {
				await handler(context);
			} catch (error) {
				console.error(error);
			}
		}
	} catch (error) {
		console.error(error);
	}
}
