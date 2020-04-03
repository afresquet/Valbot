import tmi from "tmi.js";

export const isMod = (channel: string, userstate: tmi.ChatUserstate) =>
	channel === `#${userstate.username}` || !!userstate.mod;
