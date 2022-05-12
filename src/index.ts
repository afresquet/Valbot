import Discord from "discord.js";
import "dotenv/config";
import tmi, { ExtendedClient } from "tmi.js";
import { setupHandlers as setupDiscordHandlers } from "./discord/handlers";
import { setupHandlers as setupTwitchHandlers } from "./twitch/handlers";

async function run() {
	try {
		console.log("Starting Discord and Twitch clients...");

		const discord = new Discord.Client({
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
		discord.commands = new Discord.Collection();

		const twitch = tmi.client({
			options: { debug: false },
			connection: {
				secure: true,
				reconnect: true,
			},
			identity: {
				username: process.env.TWITCH_USERNAME,
				password: process.env.TWITCH_PASSWORD,
			},
			channels: ["valaxor_"],
		}) as ExtendedClient;
		twitch.commands = new Map();

		await setupDiscordHandlers(discord);
		await setupTwitchHandlers(twitch);

		await discord.login(process.env.DISCORD_TOKEN);
		await twitch.connect();
	} catch (error) {
		console.error(error);
	}
}

run();
