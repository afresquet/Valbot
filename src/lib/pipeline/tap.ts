import { isPromise } from "util/types";
import type { Pipeline } from "./pipeline";

export function tap<Value, LocalContext, GlobalContext>(
	fn: Pipeline.Step<Value, void | Promise<void>, LocalContext, GlobalContext>
): Pipeline.Step<Value, Value, LocalContext, GlobalContext> {
	return (value, context, globalContext) => {
		const promise = fn(value, context, globalContext);

		if (isPromise(promise)) {
			return promise.then(() => value);
		}

		return value;
	};
}
