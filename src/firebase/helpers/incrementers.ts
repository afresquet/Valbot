import admin from "firebase-admin";

export const createIncrementer = (amount: number) =>
	admin.firestore.FieldValue.increment(amount);

export const incrementByOne = createIncrementer(1);
export const decrementByOne = createIncrementer(-1);
