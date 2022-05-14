import type { Pipeline } from "./pipeline";
import { tap } from "./tap";

export function assert<Value, Context, Global>(
	throwable: Pipeline.Pipeline<Value, any, Context, Global>
) {
	return tap<Value, Context, Global>((value, context, global) => {
		if (value === undefined || value === null) {
			throw throwable(value as Value, context, global);
		}
	}) as unknown as Pipeline.Pipeline<
		Value,
		NonNullable<Value>,
		Context,
		Global
	>;
}
