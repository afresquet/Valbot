import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import admin from "firebase-admin";
import * as functions from "firebase-functions";
import passport from "passport";
import DiscordStrategy from "passport-discord";
import { User } from "./types/User";

admin.initializeApp({
	credential: admin.credential.cert({
		clientEmail: process.env.FIREBASE_DEV_CLIENT_EMAIL,
		privateKey: process.env.FIREBASE_DEV_PRIVATE_KEY?.replace(/\\n/g, "\n"),
		projectId: process.env.FIREBASE_DEV_PROJECT_ID,
	}),
	databaseURL: `https://${process.env.FIREBASE_DEV_PROJECT_ID}.firebaseio.com/`,
});

const auth = admin.auth();
const firestore = admin.firestore();

const app = express();

app.use(express.json());

app.use(cookieParser());

passport.use(
	new DiscordStrategy(
		{
			clientID: process.env.DISCORD_DEV_CLIENT_ID!,
			clientSecret: process.env.DISCORD_DEV_CLIENT_SECRET!,
			callbackURL: "api/auth/discord",
			scope: ["identify", "email", "guilds"],
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				const ref = firestore.collection("users").doc(profile.id);

				const snapshot = await ref.get();

				if (snapshot.exists) {
					done(null, snapshot.data());

					return;
				}

				const user: User = { uid: profile.id, accessToken, refreshToken };

				await Promise.all([auth.createUser(user), ref.set(user)]);

				done(null, user);
			} catch (error) {
				done(error);
			}
		}
	)
);

app.use(passport.initialize());

app.get(
	"/login",
	passport.authenticate("discord", {
		failureRedirect: "/login",
		session: false,
	})
);

app.get(
	"/auth/discord",
	passport.authenticate("discord", {
		failureRedirect: "/login",
		session: false,
	})
);

app.get("/me", (req, res) => {
	if (req.user) {
		res.json(req.user);
	} else {
		res.status(403).send("Not Authorized");
	}
});

export const api = functions.https.onRequest(app);
