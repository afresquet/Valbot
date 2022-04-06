import mongoose from "mongoose";
import type { Event } from "../../types/discord";

const connectDBEvent: Event<"ready"> = {
	name: "connect-db",
	event: "ready",
	execute: async () => {
		try {
			console.log("Connecting to database...");

			await mongoose.connect(process.env.MONGODB_URI);

			console.log("Connected to database!");
		} catch (error) {
			console.error(error);
		}
	},
};

export default connectDBEvent;
