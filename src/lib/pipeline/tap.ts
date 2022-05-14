import { isPromise } from "util/types";
import type { Pipeline } from "./pipeline";

export function tap<Value, Context, Global>(
	fn: Pipeline.Pipeline<
		Value extends PromiseLike<infer U> ? U : Value,
		void,
		Context,
		Global
	>
) {
	return ((value, context, global) => {
		const promise = fn(value, context, global);

		if (isPromise(promise)) {
			return promise.then(() => value);
		}

		return value;
	}) as Pipeline.Pipeline<
		Value extends PromiseLike<infer U> ? U : Value,
		Value,
		Context,
		Global
	>;
}
