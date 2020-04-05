import "dotenv/config";
import { discord } from "./discord";
import { applyDiscordFeatures } from "./discord/features";
import { fetchChannels } from "./firebase/fetchChannels";
import { isProduction } from "./helpers/isProduction";
import { logError } from "./helpers/logging/logError";
import { twitch } from "./twitch";
import { pubsub, pubsubOnRedemption, setupTwitchClient } from "./twitch/api";
import { applyTwitchFeatures } from "./twitch/features";

async function main() {
	// PubSub hardcoded to my channel, maybe use channels array in the future?
	const [channels] = await Promise.all([
		fetchChannels(),
		applyDiscordFeatures(discord, twitch),
		applyTwitchFeatures(twitch, discord),
		setupTwitchClient().then(twitchClient =>
			pubsub.registerUserListener(twitchClient, "valaxor_")
		),
	]);

	discord.on("ready", () => {
		console.log(`Logged to Discord as ${discord.user?.tag}!`);
	});

	(twitch as any).opts.channels = channels;

	twitch.on("connected", () => {
		console.log(`Logged to Twitch as ${twitch.getUsername()}!`);
	});

	pubsub
		.onRedemption("valaxor_", pubsubOnRedemption(twitch))
		.catch(logError("Error: PubSub.onRedemption"));

	const { DISCORD_TOKEN, DISCORD_DEV_TOKEN } = process.env;
	await discord.login(isProduction ? DISCORD_TOKEN : DISCORD_DEV_TOKEN);

	await twitch.connect();
}

main().catch(logError("Error"));
