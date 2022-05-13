import { isPromise } from "util/types";
import type { Pipeline } from "./pipeline";

export function pairwise<Value, NextValue, LocalContext, GlobalContext>(
	fn: Pipeline.Step<Value, NextValue, LocalContext, GlobalContext>
): Pipeline.Step<Value, [Value, NextValue], LocalContext, GlobalContext> {
	return (
		value: Value,
		localContext: LocalContext,
		globalContext: GlobalContext
	) => {
		const result = fn(value, localContext, globalContext);

		if (isPromise(result)) {
			return result.then(r => [value, r]);
		}

		return [value, result];
	};
}
