import Discord from "discord.js";
import tmi from "tmi.js";
import { TwitchFeature } from "../../types/Feature";
import { commands } from "./commands";

export const features: TwitchFeature[] = [commands];

export const applyTwitchFeatures = (
	twitch: tmi.Client,
	discord: Discord.Client
) => {
	features.forEach(feature => feature(twitch, discord));
};
