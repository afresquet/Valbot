import { Pipeline } from "./pipeline";

interface Match<Value, Result, Context, Global> {
	run(
		value: Value,
		context: Context,
		global: Global
	): Result | Promise<Result> | null;

	on(
		matcher: (
			value: Value,
			context: Context,
			global: Global
		) => boolean | Promise<boolean>,
		pipeline: Pipeline.Pipeline<Value, Result, Context, Global>
	): Match<Value, Result, Context, Global>;

	otherwise(
		pipeline: Pipeline.Pipeline<Value, Result, Context, Global>
	): Match<Value, Result, Context, Global>;
}

class MatchBuilder<Value, Result, Context, Global>
	implements Match<Value, Result, Context, Global>
{
	private matchers: {
		matcher: Pipeline.Pipeline<Value, boolean, Context, Global>;
		pipeline: Pipeline.Pipeline<Value, Result, Context, Global>;
	}[] = [];

	private otherwisePipeline?: Pipeline.Pipeline<Value, Result, Context, Global>;

	run(
		value: Value,
		context: Context,
		global: Global
	): Result | Promise<Result> | null {
		for (const { matcher, pipeline } of this.matchers) {
			if (matcher(value, context, global) && pipeline) {
				return pipeline(value, context, global);
			}
		}

		return this.otherwisePipeline?.(value, context, global) ?? null;
	}

	on(
		matcher: Pipeline.Pipeline<Value, boolean, Context, Global>,
		pipeline?: Pipeline.Pipeline<Value, Result, Context, Global>
	) {
		if (pipeline) {
			this.matchers.push({ matcher, pipeline });
		}

		return this;
	}

	otherwise(pipeline: Pipeline.Pipeline<Value, Result, Context, Global>) {
		this.otherwisePipeline = pipeline;

		return this;
	}
}

export function match<Value, Result, Context, Global>(
	matchFn: (m: Match<Value, Result, Context, Global>) => void
): Pipeline.Pipeline<Value, Result, Context, Global> {
	const builder = new MatchBuilder<Value, Result, Context, Global>();

	matchFn(builder);

	return builder.run.bind(builder);
}
