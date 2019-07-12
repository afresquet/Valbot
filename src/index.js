import dotenv from "dotenv";
import createDiscordClient from "./discord";
import createTwitchClient from "./twitch";

dotenv.config();

const prod = process.env.ENV === "production";

async function main() {
	const discord = createDiscordClient(prod);

	const { DISCORD_TOKEN, DISCORD_DEV_TOKEN } = process.env;
	await discord.login(prod ? DISCORD_TOKEN : DISCORD_DEV_TOKEN);

	const { TWITCH_BOT_PASSWORD } = process.env;
	const twitch = createTwitchClient(prod, discord.log, TWITCH_BOT_PASSWORD);

	twitch.connect();
}
main();
