import Discord from "discord.js";
import "dotenv/config";
import { setupHandlers } from "./handlers";

async function run() {
	try {
		console.log("Starting Discord client...");

		const client = new Discord.Client({
			restTimeOffset: 0,
			partials: ["MESSAGE", "CHANNEL", "REACTION"],
			intents: [
				Discord.Intents.FLAGS.GUILDS,
				Discord.Intents.FLAGS.GUILD_MEMBERS,
				Discord.Intents.FLAGS.GUILD_MESSAGES,
				Discord.Intents.FLAGS.GUILD_VOICE_STATES,
				Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
				Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
			],
		});

		client.commands = new Discord.Collection();

		await setupHandlers(client);

		client.login(process.env.DISCORD_TOKEN).catch(console.error);
	} catch (error) {
		console.error(error);
	}
}

run();
