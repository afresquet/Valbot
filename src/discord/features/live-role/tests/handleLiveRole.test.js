const { handleLiveRole } = require("../steps/handleLiveRole");

describe("handleLiveRole step", () => {
	const value = {
		role: { id: "roleId" },
		hasLiveRole: true,
		isStreaming: true,
	};
	const context = {
		newPresence: {
			member: {
				roles: {
					add: jest.fn(),
					remove: jest.fn(),
				},
			},
		},
	};

	beforeEach(jest.clearAllMocks);

	test("applies the role if the member is streaming and doesn't have the role", async () => {
		await handleLiveRole(
			{
				...value,
				hasLiveRole: false,
			},
			context
		);

		expect(context.newPresence.member.roles.add).toHaveBeenCalledWith(
			value.role
		);
		expect(context.newPresence.member.roles.remove).not.toHaveBeenCalled();
	});

	test("removes the role if the member isn't streaming and has the role", async () => {
		await handleLiveRole(
			{
				...value,
				isStreaming: false,
			},
			context
		);

		expect(context.newPresence.member.roles.add).not.toHaveBeenCalled();
		expect(context.newPresence.member.roles.remove).toHaveBeenCalledWith(
			value.role
		);
	});

	test("does nothing if member is streaming and has the role", async () => {
		await handleLiveRole(value, context);

		expect(context.newPresence.member.roles.add).not.toHaveBeenCalled();
		expect(context.newPresence.member.roles.remove).not.toHaveBeenCalled();
	});

	test("does nothing if member is not streaming and doesn't have the role", async () => {
		await handleLiveRole(
			{ ...value, hasLiveRole: false, isStreaming: false },
			context
		);

		expect(context.newPresence.member.roles.add).not.toHaveBeenCalled();
		expect(context.newPresence.member.roles.remove).not.toHaveBeenCalled();
	});
});
