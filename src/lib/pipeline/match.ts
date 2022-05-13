import { Pipeline } from "./pipeline";

interface Match<Value, ReturnValue, LocalContext, GlobalContext> {
	run(
		value: Value,
		localContext: LocalContext,
		globalContext: GlobalContext
	): ReturnValue | Promise<ReturnValue> | null;

	on(
		matcher: (
			value: Value,
			context: LocalContext,
			globalContext: GlobalContext
		) => boolean | Promise<boolean>,
		pipeline: Pipeline.Step<Value, ReturnValue, LocalContext, GlobalContext>
	): Match<Value, ReturnValue, LocalContext, GlobalContext>;

	otherwise(
		pipeline: Pipeline.Step<Value, ReturnValue, LocalContext, GlobalContext>
	): Match<Value, ReturnValue, LocalContext, GlobalContext>;
}

class MatchBuilder<Value, ReturnValue, LocalContext, GlobalContext>
	implements Match<Value, ReturnValue, LocalContext, GlobalContext>
{
	private matchers: {
		matcher: Pipeline.Step<Value, boolean, LocalContext, GlobalContext>;
		pipeline: Pipeline.Step<Value, ReturnValue, LocalContext, GlobalContext>;
	}[] = [];

	private otherwisePipeline?: Pipeline.Step<
		Value,
		ReturnValue,
		LocalContext,
		GlobalContext
	>;

	run(
		value: Value,
		localContext: LocalContext,
		globalContext: GlobalContext
	): ReturnValue | Promise<ReturnValue> | null {
		for (const { matcher, pipeline } of this.matchers) {
			if (matcher(value, localContext, globalContext) && pipeline) {
				return pipeline(value, localContext, globalContext);
			}
		}

		return this.otherwisePipeline?.(value, localContext, globalContext) ?? null;
	}

	on(
		matcher: Pipeline.Step<Value, boolean, LocalContext, GlobalContext>,
		pipeline?: Pipeline.Step<Value, ReturnValue, LocalContext, GlobalContext>
	) {
		if (pipeline) {
			this.matchers.push({ matcher, pipeline });
		}

		return this;
	}

	otherwise(
		pipeline: Pipeline.Step<Value, ReturnValue, LocalContext, GlobalContext>
	) {
		this.otherwisePipeline = pipeline;

		return this;
	}
}

export function match<Value, ReturnValue, LocalContext, GlobalContext>(
	matchFn: (m: Match<Value, ReturnValue, LocalContext, GlobalContext>) => void
): Pipeline.Step<Value, ReturnValue, LocalContext, GlobalContext> {
	const builder = new MatchBuilder<
		Value,
		ReturnValue,
		LocalContext,
		GlobalContext
	>();

	matchFn(builder);

	return builder.run.bind(builder);
}
