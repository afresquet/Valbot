const { match } = require("../match");

describe("pipeline lib tap step", () => {
	const value = 10;

	test("executes pipeline if the condition matches", () => {
		const localContext = { run: 1 };
		const globalContext = { foo: "bar" };

		const matcher = jest.fn((x, y) => y.run === 1);
		const step = jest.fn(x => x * 2);

		const fn = match(m => m.on(matcher, step));

		const result = fn(value, localContext, globalContext);

		expect(result).toBe(20);
		expect(matcher).toHaveBeenCalledWith(value, localContext, globalContext);
		expect(step).toHaveBeenCalledWith(value, localContext, globalContext);
	});

	test("doesn't execute pipeline if the condition doesn't match", () => {
		const localContext = { run: 2 };
		const globalContext = { foo: "bar" };

		const matcher1 = jest.fn((x, y) => y.run === 1);
		const step1 = jest.fn(x => x * 2);
		const matcher2 = jest.fn((x, y) => y.run === 2);
		const step2 = jest.fn(x => x / 2);

		const fn = match(m => m.on(matcher1, step1).on(matcher2, step2));

		const result = fn(value, localContext, globalContext);

		expect(result).toBe(5);
		expect(matcher1).toHaveBeenCalledWith(value, localContext, globalContext);
		expect(step1).not.toHaveBeenCalled();
		expect(matcher2).toHaveBeenCalledWith(value, localContext, globalContext);
		expect(step2).toHaveBeenCalledWith(value, localContext, globalContext);
	});

	test("calls 'otherwise' pipeline if no condition matches", () => {
		const localContext = { run: 2 };
		const globalContext = { foo: "bar" };

		const matcher = jest.fn((x, y) => y.run === 1);
		const step = jest.fn(x => x * 2);
		const otherwise = jest.fn(x => x / 2);

		const fn = match(m => m.on(matcher, step).otherwise(otherwise));

		const result = fn(value, localContext, globalContext);

		expect(result).toBe(5);
		expect(matcher).toHaveBeenCalledWith(value, localContext, globalContext);
		expect(step).not.toHaveBeenCalled();
		expect(otherwise).toHaveBeenCalledWith(value, localContext, globalContext);
	});

	test("returns null if no condition matches and no 'otherwise' function was provided", () => {
		const localContext = { run: 2 };
		const globalContext = { foo: "bar" };

		const matcher = jest.fn((x, y) => y.run === 1);
		const step = jest.fn(x => x * 2);

		const fn = match(m => m.on(matcher, step));

		const result = fn(value, localContext, globalContext);

		expect(result).toBeNull();
		expect(matcher).toHaveBeenCalledWith(value, localContext, globalContext);
		expect(step).not.toHaveBeenCalled();
	});
});
