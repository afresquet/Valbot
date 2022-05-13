import { Document, model, Model, Schema } from "mongoose";

/* ----- TYPES ----- */
export interface ICommand {
	channel: string;
	name: string;
	subcommand?: string;
	message: string;
}

export interface ICommandDocument extends ICommand, Document {}

export interface ICommandModel extends Model<ICommandDocument> {}

/* ----- SCHEMA ----- */
const CommandSchema = new Schema<ICommandDocument>({
	channel: String,
	name: String,
	subcommand: { type: String, required: false },
	message: String,
});

/* ----- STATICS ----- */

/* ----- MODEL ----- */
export const CommandModel = model<ICommandDocument, ICommandModel>(
	"Command",
	CommandSchema
);
