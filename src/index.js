import dotenv from "dotenv";
import * as firebase from "firebase-admin";
import createDiscordClient from "./discord";
import createTwitchClient from "./twitch";

dotenv.config();

async function main() {
	const prod = process.env.ENV === "production";

	// FIREBASE
	const {
		FIREBASE_CLIENT_EMAIL,
		FIREBASE_PRIVATE_KEY,
		FIREBASE_PROJECT_ID,
		FIREBASE_DEV_CLIENT_EMAIL,
		FIREBASE_DEV_PRIVATE_KEY,
		FIREBASE_DEV_PROJECT_ID
	} = process.env;

	const firebaseCredentials = {
		clientEmail: prod ? FIREBASE_CLIENT_EMAIL : FIREBASE_DEV_CLIENT_EMAIL,
		privateKey: prod ? FIREBASE_PRIVATE_KEY : FIREBASE_DEV_PRIVATE_KEY,
		projectId: prod ? FIREBASE_PROJECT_ID : FIREBASE_DEV_PROJECT_ID
	};

	firebase.initializeApp({
		credential: firebase.credential.cert({
			clientEmail: firebaseCredentials.clientEmail,
			privateKey: firebaseCredentials.privateKey.replace(/\\n/g, "\n"),
			projectId: firebaseCredentials.projectId
		}),
		databaseURL: `https://${FIREBASE_PROJECT_ID}.firebaseio.com`
	});

	const db = firebase.firestore();

	// DISCORD
	const discord = createDiscordClient(db, prod);

	const { DISCORD_TOKEN, DISCORD_DEV_TOKEN } = process.env;

	await discord.login(prod ? DISCORD_TOKEN : DISCORD_DEV_TOKEN);

	// TWITCH
	const {
		TWITCH_BOT_USERNAME,
		TWITCH_BOT_PASSWORD,
		TWITCH_BOT_DEV_USERNAME,
		TWITCH_BOT_DEV_PASSWORD
	} = process.env;

	const twitchCredentials = {
		username: prod ? TWITCH_BOT_USERNAME : TWITCH_BOT_DEV_USERNAME,
		password: prod ? TWITCH_BOT_PASSWORD : TWITCH_BOT_DEV_PASSWORD
	};

	const twitch = await createTwitchClient(
		db,
		discord.log,
		prod,
		twitchCredentials
	);

	twitch.connect();
}
main();
