import seedrandom from "seedrandom";
import { fetchHouseQuote } from "../../../firebase/fetchHouseQuote";
import { prefixChannelReward } from "../../../helpers/prefixString";
import { TwitchFeature } from "../../../types/Feature";
import { PubSubListener } from "../../../types/PubSubListener";

enum Houses {
	Gryffindor,
	Hufflepuff,
	Ravenclaw,
	Slytherin,
}

const seededHouse = (seed: string) => {
	const randomWithSeed = seedrandom(seed);

	const house = Math.floor(randomWithSeed() * 4);

	return Houses[house];
};

export const sortingHat: TwitchFeature = twitch => {
	const listener: PubSubListener = async (channel, userstate, reaction) => {
		if (reaction.rewardName !== prefixChannelReward("Hogwarts' Sorting Hat"))
			return;

		const house = seededHouse(userstate.id);

		const quote = await fetchHouseQuote(house);

		await twitch.say(channel, `@${userstate.name}, ${quote}`);
	};
	twitch.on("pubsub" as any, listener);
};
