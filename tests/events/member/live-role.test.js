const { LiveRoleModel } = require("../../../src/schemas/LiveRole");
const liveRoleUpdateEvent =
	require("../../../src/events/member/live-role").default;

describe("live-role member event", () => {
	const role = { id: "roleId" };
	const newPresence = {
		guild: {
			id: "guildId",
		},
		member: {
			roles: {
				add: jest.fn(),
				remove: jest.fn(),
				cache: [role],
			},
			presence: {
				activities: [{ type: "STREAMING" }],
			},
		},
	};

	beforeEach(() => {
		jest.clearAllMocks();

		jest.spyOn(LiveRoleModel, "findRoleByGuild").mockReturnValue(role);
	});

	test("applies the role if the member is streaming and doesn't have the role", async () => {
		await liveRoleUpdateEvent.execute(undefined, {
			...newPresence,
			member: {
				...newPresence.member,
				roles: {
					...newPresence.member.roles,
					cache: [],
				},
			},
		});

		expect(newPresence.member.roles.add).toHaveBeenCalledWith(role);
		expect(newPresence.member.roles.remove).not.toHaveBeenCalled();
	});

	test("removes the role if the member isn't streaming and has the role", async () => {
		await liveRoleUpdateEvent.execute(undefined, {
			...newPresence,
			member: {
				...newPresence.member,
				presence: {
					...newPresence.member.presence,
					activities: [],
				},
			},
		});

		expect(newPresence.member.roles.add).not.toHaveBeenCalled();
		expect(newPresence.member.roles.remove).toHaveBeenCalledWith(role);
	});

	test("does nothing if member is streaming and has the role", async () => {
		await liveRoleUpdateEvent.execute(undefined, newPresence);

		expect(newPresence.member.roles.add).not.toHaveBeenCalled();
		expect(newPresence.member.roles.remove).not.toHaveBeenCalled();
	});

	test("does nothing if member is not streaming and doesn't have the role", async () => {
		await liveRoleUpdateEvent.execute(undefined, {
			...newPresence,
			member: {
				...newPresence.member,
				roles: {
					...newPresence.member.roles,
					cache: [],
				},
				presence: {
					...newPresence.member.presence,
					activities: [],
				},
			},
		});

		expect(newPresence.member.roles.add).not.toHaveBeenCalled();
		expect(newPresence.member.roles.remove).not.toHaveBeenCalled();
	});

	test("returns if it's not setup", async () => {
		jest.spyOn(LiveRoleModel, "findRoleByGuild").mockReturnValueOnce();

		await liveRoleUpdateEvent.execute(undefined, newPresence);

		expect(newPresence.member.roles.add).not.toHaveBeenCalled();
		expect(newPresence.member.roles.remove).not.toHaveBeenCalled();
	});
});
