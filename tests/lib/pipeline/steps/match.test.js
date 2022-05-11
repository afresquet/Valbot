const { match } = require("../../../../src/lib/pipeline/steps/match");

describe("pipeline lib tap step", () => {
	const value = 10;

	test("executes pipeline if the condition matches", () => {
		const context = { run: 1 };

		const matcher = jest.fn((x, y) => y.run === 1);
		const step = jest.fn(x => x * 2);

		const fn = match(m => m.on(matcher, step));

		const result = fn(value, context);

		expect(result).toBe(20);
		expect(matcher).toHaveBeenCalledWith(value, context);
		expect(step).toHaveBeenCalledWith(value, context);
	});

	test("doesn't execute pipeline if the condition doesn't match", () => {
		const context = { run: 2 };

		const matcher1 = jest.fn((x, y) => y.run === 1);
		const step1 = jest.fn(x => x * 2);
		const matcher2 = jest.fn((x, y) => y.run === 2);
		const step2 = jest.fn(x => x / 2);

		const fn = match(m => m.on(matcher1, step1).on(matcher2, step2));

		const result = fn(value, context);

		expect(result).toBe(5);
		expect(matcher1).toHaveBeenCalledWith(value, context);
		expect(step1).not.toHaveBeenCalled();
		expect(matcher2).toHaveBeenCalledWith(value, context);
		expect(step2).toHaveBeenCalledWith(value, context);
	});

	test("calls 'otherwise' pipeline if no condition matches", () => {
		const context = { run: 2 };

		const matcher = jest.fn((x, y) => y.run === 1);
		const step = jest.fn(x => x * 2);
		const otherwise = jest.fn(x => x / 2);

		const fn = match(m => m.on(matcher, step).otherwise(otherwise));

		const result = fn(value, context);

		expect(result).toBe(5);
		expect(matcher).toHaveBeenCalledWith(value, context);
		expect(step).not.toHaveBeenCalled();
		expect(otherwise).toHaveBeenCalledWith(value, context);
	});

	test("throws error if no condition matches and there's no 'otherwise' pipeline provided", () => {
		const context = { run: 2 };

		const matcher = jest.fn((x, y) => y.run === 1);
		const step = jest.fn(x => x * 2);

		const fn = match(m => m.on(matcher, step));

		expect(() => fn(value, context)).toThrow(
			"No 'otherwise' pipeline defined for unmatched value"
		);
		expect(matcher).toHaveBeenCalledWith(value, context);
		expect(step).not.toHaveBeenCalled();
	});
});