import { firebase } from "..";
import { randomArrayElement } from "../../helpers/randomArrayElement";
import { Quote } from "./Quote";

export const fetchQuote = async (number?: string): Promise<Quote | null> => {
	if (!number) {
		const quotesSnapshot = await firebase
			.collection("quotes")
			.where("deleted", "==", false)
			.get();

		if (quotesSnapshot.empty) return null;

		const randomDoc = randomArrayElement(quotesSnapshot.docs);

		return randomDoc.data() as Quote;
	}

	const quoteSnapshot = await firebase
		.collection("quotes")
		.doc(number)
		.get();

	if (!quoteSnapshot.exists) return null;

	const quote = quoteSnapshot.data()! as Quote;

	return quote.deleted ? null : quote;
};
