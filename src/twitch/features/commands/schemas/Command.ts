import { Document, model, Model, Schema } from "mongoose";

/* ----- TYPES ----- */
interface ICommand {
	channel: string;
	name: string;
	message: string;
}

export interface ICommandDocument extends ICommand, Document {}

export interface ICommandModel extends Model<ICommandDocument> {}

/* ----- SCHEMA ----- */
const CommandSchema = new Schema<ICommandDocument>({
	channel: String,
	name: String,
	message: String,
});

/* ----- STATICS ----- */

/* ----- MODEL ----- */
export const CommandModel = model<ICommandDocument, ICommandModel>(
	"Command",
	CommandSchema
);
