import Discord from "discord.js";
import { setupHandlers } from "./handlers";

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

client.setupHandlers = setupHandlers;

client.start = async () => {
	await client.login(process.env.DISCORD_TOKEN);
};

export default client;
