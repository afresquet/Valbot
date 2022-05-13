import { Errors } from "../../utils/Errors";
import type { Pipeline } from "./pipeline";
import { tap } from "./tap";

export function assert<Value, LocalContext, GlobalContext>(
	throwable?: Pipeline.Step<Value, any, LocalContext, GlobalContext>
): Pipeline.Step<Value, NonNullable<Value>, LocalContext, GlobalContext> {
	return tap<Value, LocalContext, GlobalContext>(
		(value, localContext, globalContext) => {
			if (value === undefined || value === null) {
				throw (
					throwable?.(value, localContext, globalContext) ?? new Errors.Exit()
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
