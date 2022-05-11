import type { Guild, Role } from "discord.js";
import { Document, model, Model, Schema } from "mongoose";

/* ----- TYPES ----- */
interface ILiveRole {
	guildId: string;
	roleId: string;
}

export interface ILiveRoleDocument extends ILiveRole, Document {}

export interface ILiveRoleModel extends Model<ILiveRoleDocument> {
	findByGuild: (guild: Guild) => Promise<ILiveRoleDocument | undefined>;
	findRoleByGuild: (guild: Guild) => Promise<Role | undefined>;
}

/* ----- SCHEMA ----- */
const LiveRoleSchema = new Schema<ILiveRoleDocument>({
	guildId: String,
	roleId: String,
});

/* ----- STATICS ----- */
LiveRoleSchema.statics.findByGuild = function (
	guild: Guild
): Promise<ILiveRoleDocument | undefined> {
	return this.findOne({
		guildId: guild.id,
	});
};

LiveRoleSchema.statics.findRoleByGuild = async function (
	guild: Guild
): Promise<Role | undefined> {
	const document: ILiveRoleDocument = await this.findOne({
		guildId: guild.id,
	});

	if (!document) return;

	return guild.roles.cache.find(role => role.id === document.roleId);
};

/* ----- MODEL ----- */
export const LiveRoleModel = model<ILiveRoleDocument, ILiveRoleModel>(
	"LiveRole",
	LiveRoleSchema
);
