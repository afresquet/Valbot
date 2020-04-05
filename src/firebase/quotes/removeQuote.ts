import { firebase } from "..";

export const removeQuote = async (number: string): Promise<boolean> => {
	const ref = firebase.collection("quotes").doc(number);

	if (!(await ref.get()).exists) return false;

	await ref.update({ deleted: true });

	return true;
};
