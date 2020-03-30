import "dotenv/config";
import { discord } from "./discord";
import { fetchChannels } from "./firebase/fetchChannels";
import { isProduction } from "./helpers/isProduction";
import { twitch } from "./twitch";

async function main() {
	(twitch as any).opts.channels = await fetchChannels();

	twitch.on("connected", () => {
		twitch.getOptions().channels?.forEach(channel => {
			twitch.action(channel, `is online!`);
		});
	});

	discord.on("ready", () => {
		console.log(`Logged to Discord as ${discord.user?.tag}!`);
	});

	const { DISCORD_TOKEN, DISCORD_DEV_TOKEN } = process.env;
	await discord.login(isProduction ? DISCORD_TOKEN : DISCORD_DEV_TOKEN);

	await twitch.connect();
}

main().catch(console.log);
