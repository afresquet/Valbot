import { isProduction } from "../../helpers/isProduction";

export const rewardNameRegex = isProduction
	? /^[^Bot](.+\S)\s*role in my Discord server/
	: /^(Bot\s.+\S)\s*role in my Discord server/;
