import { isPromise } from "util/types";
import type { Pipeline } from "./pipeline";

export function ifelse<Value, NextValue, LocalContext, GlobalContext>(
	condition: Pipeline.Step<Value, boolean, LocalContext, GlobalContext>,
	then: Pipeline.Step<Value, NextValue, LocalContext, GlobalContext>,
	otherwise: Pipeline.Step<
		Value,
		NextValue,
		LocalContext,
		GlobalContext
	> = value => value as any
): Pipeline.Step<Value, NextValue, LocalContext, GlobalContext> {
	return (...args) => {
		const result = condition(...args);

		if (isPromise(result)) {
			return (result as Promise<boolean>).then(b =>
				b ? then(...args) : otherwise(...args)
			);
		}

		return result ? then(...args) : otherwise(...args);
	};
}
