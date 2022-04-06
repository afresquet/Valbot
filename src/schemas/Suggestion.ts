import { model, Schema } from "mongoose";

export const SuggestionModel = model(
	"Suggestion",
	new Schema({
		guildId: String,
		channelId: String,
	})
);
