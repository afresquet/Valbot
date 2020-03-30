import Discord from "discord.js";
import tmi from "tmi.js";
import { DiscordFeature } from "../../types/Feature";

export const features: DiscordFeature[] = [];

export const applyDiscordFeatures = (
	discord: Discord.Client,
	twitch: tmi.Client
) => {
	return Promise.all(features.map(feature => feature(discord, twitch)));
};
