import "dotenv/config";
import { connectDB } from "./db";
import discord from "./discord";
import twitch from "./twitch";
import { Context } from "./types/Context";
import { Errors } from "./utils/Errors";
import { setupHandlers } from "./utils/setupHandlers";
import { startClients } from "./utils/startClients";

async function run() {
	try {
		const db = await connectDB();

		const context: Context = { discord, twitch, db, Errors };

		await setupHandlers(context, discord, twitch);

		await startClients(discord, twitch);
	} catch (error) {
		console.error(error);
	}
}

run();
