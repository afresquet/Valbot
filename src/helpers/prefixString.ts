import { isProduction } from "./isProduction";

export const prefixString = (prefix: string) => (string: string) =>
	isProduction ? string : prefix + string;

export const prefixChannel = prefixString("bot-");
