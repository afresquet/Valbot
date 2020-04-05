import { firebase } from "..";
import { incrementByOne } from "../helpers/incrementers";

export const createQuote = async (quote: string, author: string) => {
	const statsRef = firebase.collection("quotes").doc("--stats--");
	const statsSnapshot = await statsRef.get();

	const number: number = statsSnapshot.exists
		? statsSnapshot.data()!.count + 1
		: 1;

	const quoteRef = firebase.collection("quotes").doc(number.toString());

	const batch = firebase.batch();

	batch.set(quoteRef, {
		number,
		quote,
		author,
		date: new Date(),
		deleted: false,
	});

	batch.set(statsRef, { count: incrementByOne }, { merge: true });

	await batch.commit();

	return number;
};
