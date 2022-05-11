import { Guild } from "discord.js";
import { Document, model, Model, Schema } from "mongoose";

/* ----- TYPES ----- */
interface ISuggestion {
	guildId: string;
	channelId: string;
}

export interface ISuggestionDocument extends ISuggestion, Document {}

export interface ISuggestionModel extends Model<ISuggestionDocument> {
	findByGuild: (guild: Guild) => Promise<ISuggestionDocument | undefined>;
}

/* ----- SCHEMA ----- */
const SuggestionSchema = new Schema<ISuggestionDocument>({
	guildId: String,
	channelId: String,
});

/* ----- STATICS ----- */
SuggestionSchema.statics.findByGuild = function (
	guild: Guild
): Promise<ISuggestionDocument | undefined> {
	return this.findOne({
		guildId: guild.id,
	});
};

/* ----- MODEL ----- */
export const SuggestionModel = model<ISuggestionDocument, ISuggestionModel>(
	"Suggestion",
	SuggestionSchema
);
