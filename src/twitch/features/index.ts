import Discord from "discord.js";
import tmi from "tmi.js";
import { TwitchFeature } from "../../types/Feature";
import { channelPointRewards } from "./channel-point-rewards";
import { commands } from "./commands";
import { magic8Ball } from "./magic8Ball";
import { quotes } from "./quotes";
import { songRequest } from "./songRequest";
import { timer } from "./timer";

export const features: TwitchFeature[] = [
	...channelPointRewards,
	commands,
	magic8Ball,
	quotes,
	songRequest,
	timer,
];

export const applyTwitchFeatures = (
	twitch: tmi.Client,
	discord: Discord.Client
) => {
	return Promise.all(features.map(feature => feature(twitch, discord)));
};
