import { ILiveRoleModel } from "../discord/features/live-role/schemas/LiveRole";
import { ISuggestionModel } from "../discord/features/suggestions/schemas/Suggestion";
import { ICommandModel } from "../twitch/features/commands/schemas/Command";

export interface Models {
	// Discord
	LiveRoleModel: ILiveRoleModel;
	SuggestionModel: ISuggestionModel;
	// Twitch
	CommandModel: ICommandModel;
}
