import admin from "firebase-admin";
import { isProduction } from "../helpers/isProduction";

const clientEmail = isProduction
	? process.env.FIREBASE_CLIENT_EMAIL
	: process.env.FIREBASE_DEV_CLIENT_EMAIL;

const privateKey = isProduction
	? process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
	: process.env.FIREBASE_DEV_PRIVATE_KEY?.replace(/\\n/g, "\n");

const projectId = isProduction
	? process.env.FIREBASE_PROJECT_ID
	: process.env.FIREBASE_DEV_PROJECT_ID;

admin.initializeApp({
	credential: admin.credential.cert({ clientEmail, privateKey, projectId }),
	databaseURL: `https://${projectId}.firebaseio.com/`,
});

export const firebase = admin.firestore();
