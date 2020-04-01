import tmi from "tmi.js";

export const isMod = (userstate: tmi.ChatUserstate) =>
	userstate.mod || !!userstate.badges?.broadcaster;
