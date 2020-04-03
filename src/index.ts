import "dotenv/config";
import { discord } from "./discord";
import { applyDiscordFeatures } from "./discord/features";
import { fetchChannels } from "./firebase/fetchChannels";
import { isProduction } from "./helpers/isProduction";
import { twitch } from "./twitch";
import { pubsub, setupTwitchClient } from "./twitch/api";
import { applyTwitchFeatures } from "./twitch/features";

async function main() {
	discord.on("ready", () => {
		console.log(`Logged to Discord as ${discord.user?.tag}!`);
	});

	(twitch as any).opts.channels = await fetchChannels();

	twitch.on("join", channel => {
		twitch.action(channel, `is online!`);
	});

	const twitchClient = await setupTwitchClient();

	await Promise.all([
		applyDiscordFeatures(discord, twitch),
		applyTwitchFeatures(twitch, discord),
		pubsub.registerUserListener(twitchClient, "valaxor_"),
	]);

	pubsub.onRedemption("valaxor_", message => {
		twitch.emit("pubsub" as any, message);
	});

	const { DISCORD_TOKEN, DISCORD_DEV_TOKEN } = process.env;
	await discord.login(isProduction ? DISCORD_TOKEN : DISCORD_DEV_TOKEN);

	await twitch.connect();
}

main().catch(console.log);
