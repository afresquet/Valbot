import Discord from "discord.js";
import tmi from "tmi.js";

export type TwitchFeature = (
	twitch: tmi.Client,
	discord: Discord.Client
) => void;

export type DiscordFeature = (
	discord: Discord.Client,
	twitch: tmi.Client
) => void;
