import Discord from "discord.js";
import tmi from "tmi.js";
import { DiscordFeature } from "../../types/Feature";
import { live } from "./live";
import { reactions } from "./reactions";
import { roles } from "./roles";
import { werewolf } from "./werewolf";

export const features: DiscordFeature[] = [live, reactions, roles, werewolf];

export const applyDiscordFeatures = (
	discord: Discord.Client,
	twitch: tmi.Client
) => {
	return Promise.all(features.map(feature => feature(discord, twitch)));
};
