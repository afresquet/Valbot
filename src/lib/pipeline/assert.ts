import type { Pipeline } from "./pipeline";
import { tap } from "./tap";

export function assert<Value, LocalContext, GlobalContext>(
	throwable?: Pipeline.Step<Value, any, LocalContext, GlobalContext>
): Pipeline.Step<Value, NonNullable<Value>, LocalContext, GlobalContext> {
	return tap<Value, LocalContext, GlobalContext>(
		(value, localContext, globalContext) => {
			if (value === undefined || value === null) {
				// TODO: change error to ExitError
				throw (
					throwable?.(value, localContext, globalContext) ??
					new Error("value is null or undefined")
				);
			}
		}
	) as unknown as Pipeline.Step<
		Value,
		NonNullable<Value>,
		LocalContext,
		GlobalContext
	>;
}
