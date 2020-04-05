import { firestore } from "firebase-admin";

export interface Quote {
	number: number;
	author: string;
	quote: string;
	deleted: boolean;
	date: firestore.Timestamp;
}
