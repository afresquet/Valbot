import admin from "firebase-admin";
import path from "path";
import { isProduction } from "../helpers/isProduction";

const projectId = isProduction
	? process.env.FIREBASE_PROJECT_ID
	: process.env.FIREBASE_DEV_PROJECT_ID;

admin.initializeApp({
	credential: admin.credential.cert(
		path.join(__dirname, `../../${projectId}-firebase-cert.json`)
	),
	databaseURL: `https://${projectId}.firebaseio.com/`,
});

export const firebase = admin.firestore();
