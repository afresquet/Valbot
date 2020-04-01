import { isProduction } from "../../helpers/isProduction";

export const prefixChannel = (channel: string) =>
	isProduction ? channel : `bot-${channel}`;
