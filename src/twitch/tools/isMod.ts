import tmi from "tmi.js";

export const isMod = (userstate: tmi.ChatUserstate) =>
	userstate.badges?.broadcaster || userstate.mod;
