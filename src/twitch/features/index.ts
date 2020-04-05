import Discord from "discord.js";
import tmi from "tmi.js";
import { TwitchFeature } from "../../types/Feature";
import { channelPointRewards } from "./channel-point-rewards";
import { commands } from "./commands";
import { quotes } from "./quotes";
import { timer } from "./timer";

export const features: TwitchFeature[] = [
	...channelPointRewards,
	commands,
	quotes,
	timer,
];

export const applyTwitchFeatures = (
	twitch: tmi.Client,
	discord: Discord.Client
) => {
	return Promise.all(features.map(feature => feature(twitch, discord)));
};
