const { match } = require("typepipe/dist/steps");
const { handleLiveRole } = require("../steps/handleLiveRole");

describe("handleLiveRole step", () => {
	const role = { id: "roleId" };
	const context = {
		newPresence: {
			member: {
				roles: {
					add: jest.fn(),
					remove: jest.fn(),
				},
			},
		},
		hasLiveRole: true,
		isStreaming: true,
	};

	beforeEach(jest.clearAllMocks);

	test("applies the role if the member is streaming and doesn't have the role", () => {
		match(handleLiveRole)(role, {
			...context,
			hasLiveRole: false,
		});

		expect(context.newPresence.member.roles.add).toHaveBeenCalledWith(role);
		expect(context.newPresence.member.roles.remove).not.toHaveBeenCalled();
	});

	test("removes the role if the member isn't streaming and has the role", () => {
		match(handleLiveRole)(role, {
			...context,
			isStreaming: false,
		});

		expect(context.newPresence.member.roles.add).not.toHaveBeenCalled();
		expect(context.newPresence.member.roles.remove).toHaveBeenCalledWith(role);
	});

	test("does nothing if member is streaming and has the role", () => {
		match(handleLiveRole)(role, context);

		expect(context.newPresence.member.roles.add).not.toHaveBeenCalled();
		expect(context.newPresence.member.roles.remove).not.toHaveBeenCalled();
	});

	test("does nothing if member is not streaming and doesn't have the role", () => {
		match(handleLiveRole)(role, {
			...context,
			hasLiveRole: false,
			isStreaming: false,
		});

		expect(context.newPresence.member.roles.add).not.toHaveBeenCalled();
		expect(context.newPresence.member.roles.remove).not.toHaveBeenCalled();
	});
});
