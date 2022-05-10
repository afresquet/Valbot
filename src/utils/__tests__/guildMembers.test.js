const {
	guildMemberHasRole,
	guildMemberHasActivity,
} = require("../guildMembers");

describe("guildMembers utils", () => {
	describe("guildMemberHasRole", () => {
		const role = { id: "role" };

		test("Returns true if the member has the role", () => {
			const member = { roles: { cache: [role] } };

			const result = guildMemberHasRole(member, role);

			expect(result).toBe(true);
		});

		test("Returns false if the member doesn't have the role", () => {
			const member = { roles: { cache: [] } };

			const result = guildMemberHasRole(member, role);

			expect(result).toBe(false);
		});
	});

	describe("guildMemberHasActivity", () => {
		const activity = "PLAYING";

		test("Returns true if the member has the activity type", () => {
			const member = { presence: { activities: [{ type: activity }] } };

			const result = guildMemberHasActivity(member, activity);

			expect(result).toBe(true);
		});

		test("Returns false if the member doesn't have the activity type", () => {
			const member = { presence: { activities: [] } };

			const result = guildMemberHasActivity(member, activity);

			expect(result).toBe(false);
		});

		test("Returns false if the member doesn't have presence", () => {
			const result = guildMemberHasActivity({}, activity);

			expect(result).toBe(false);
		});
	});
});
