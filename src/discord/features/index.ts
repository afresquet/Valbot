import Discord from "discord.js";
import tmi from "tmi.js";
import { DiscordFeature } from "../../types/Feature";
import { reactions } from "./reactions";

export const features: DiscordFeature[] = [reactions];

export const applyDiscordFeatures = (
	discord: Discord.Client,
	twitch: tmi.Client
) => {
	return Promise.all(features.map(feature => feature(discord, twitch)));
};
