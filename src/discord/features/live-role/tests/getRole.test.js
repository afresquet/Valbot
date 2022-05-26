const { getRole } = require("../steps/getRole");

describe("getRole step", () => {
	const event = {
		newPresence: {
			guild: { id: "guildId" },
		},
	};
	const role = { id: "roleId" };
	const context = {
		models: {
			LiveRoleModel: {
				findRoleByGuild: jest.fn(async () => role),
			},
		},
	};

	test("returns the role", () => {
		const result = getRole(undefined, event, context);

		expect(result).resolves.toBe(role);
	});
});
