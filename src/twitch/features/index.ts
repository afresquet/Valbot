import tmi from "tmi.js";
import { commands } from "./commands";

export const features = [commands];

export const applyTwitchFeatures = (twitch: tmi.Client) => {
	features.forEach(feature => feature(twitch));
};
