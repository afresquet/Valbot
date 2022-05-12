const { LiveRoleModel } = require("../../../../src/schemas/LiveRole");
const { getRole } = require("../../../../src/events/member/steps/getRole");

describe("getRole step", () => {
	const context = {
		newPresence: {
			guild: { id: "guildId" },
		},
	};
	const role = { id: "roleId" };

	test("returns the role", () => {
		jest.spyOn(LiveRoleModel, "findRoleByGuild").mockReturnValue(role);

		const result = getRole(undefined, context);

		expect(result).toBe(role);
	});
});
