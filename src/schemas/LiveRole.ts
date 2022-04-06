import { model, Schema } from "mongoose";

export const LiveRoleModel = model(
	"LiveRole",
	new Schema({
		guildId: String,
		roleId: String,
	})
);
