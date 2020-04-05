import { firebase } from ".";
import { randomArrayElement } from "../helpers/randomArrayElement";

export const fetchHouseQuote = async (house: string): Promise<string> => {
	const snapshot = await firebase
		.collection("sorting-hat")
		.doc(house)
		.get();

	if (!snapshot.exists) {
		throw new Error(`House ${house} does not exist in the database!`);
	}

	const quotes = snapshot.data()!.quotes as string[];

	return randomArrayElement(quotes);
};
