import { isProduction } from "./isProduction";

export const prefixString = (prefix: string) => (string: string) => {
	return isProduction ? string : prefix + string;
};

export const prefixChannel = prefixString("bot-");

export const prefixRole = prefixString("bot ");

export const prefixChannelReward = prefixString("Bot ");

const commandPrefixer = prefixString("bot");
export const prefixCommand = (command: string) => {
	return "!" + commandPrefixer(command);
};
