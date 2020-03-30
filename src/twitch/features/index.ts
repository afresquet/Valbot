import Discord from "discord.js";
import tmi from "tmi.js";
import { TwitchFeature } from "../../types/Feature";
import { commands } from "./commands";
import { timer } from "./timer";

export const features: TwitchFeature[] = [commands, timer];

export const applyTwitchFeatures = (
	twitch: tmi.Client,
	discord: Discord.Client
) => {
	return Promise.all(features.map(feature => feature(twitch, discord)));
};
