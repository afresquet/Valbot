import { numberEmojis, Player } from "../types";

export const listOfEveryone = (
	players: Player[],
	omit: string[] = [],
	defaultValue: string = "There are no players."
) => {
	return players.reduce((result, current, index) => {
		if (omit.includes(current.member.id)) return result;

		const playerLine = `${numberEmojis[index]} ${current.member.displayName}`;

		return result === defaultValue ? playerLine : `${result}\n${playerLine}`;
	}, defaultValue);
};
