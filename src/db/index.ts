import mongoose from "mongoose";
import { LiveRoleModel } from "../discord/features/live-role/schemas/LiveRole";
import { SuggestionModel } from "../discord/features/suggestions/schemas/Suggestion";
import { CommandModel } from "../twitch/features/commands/schemas/Command";
import { Models } from "../types/Models";

export const connectDB = async () => {
	console.log("Connecting to database...");

	const db = await mongoose.connect(process.env.MONGODB_URI);

	console.log("Connected to database!");

	return db;
};

export const models: Models = {
	// Discord
	LiveRoleModel,
	SuggestionModel,
	// Twitch
	CommandModel,
};
