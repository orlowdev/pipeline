import { BasePipeline } from "./base-pipeline";
import { MiddlewareInterface } from "./interfaces/middleware.interface";
import { IntermediateInterface } from "./interfaces/intermediate.interface";
import { Intermediate } from "./helpers/intermediate";

/**
 * Pipeline is an inverted Monoid that stores an array of middleware functions to be applied to data passed as
 * pipeline.process() argument.
 *
 * IntermediatePipeline wraps data passed to pipeline.process() into an Intermediate in order to be accessed in
 * middleware code as the value of `ctx` object under `intermediate` property. This is done to add safe dependency
 * injection that will be available without mixing up with the data itself.
 *
 * For example, Node.js IncomingMessage and ServerResponse objects from 'http(s)' module can be passed along with
 * your data so that they will not available across middleware as the context argument of:
 *
 * ```
 * {
 *   request: IncomingMessage,
 *   response: ServerResponse,
 *   intermediate: YourData,
 * }
 * ```
 *
 * IntermediatePipeline has two generic types that can be defined with its constructor or
 * IntermediatePipeline.(of|from). The first type (TContext) is inferred from the `.process` argument. If the
 * argument is not an intermediate, it will be wrapped into intermediate using `Intermediate.of`.
 *
 * The second type (TWrapper) is the wrapper object. It includes intermediate as well as other properties. In order
 * to customise its type, you can pass it as the second generic type which must extend `IntermediateInterface`.
 * Thus, the following type can be considered a TWrapper:
 *
 * ```
 * interface HttpIntermediateWrapper extends IntermediateInterface<YourData> {
 *   request: IncomingMessage,
 *   response: ServerResponse,
 *   intermediate: YourData,
 * }
 * ```
 *
 * **NOTE**: IntermediatePipeline creates a shallow copy of the context argument. If you pass objects along with
 * intermediate, they will be MUTABLE!
 */
export class IntermediatePipeline<
  TContext,
  TWrapper extends IntermediateInterface = IntermediateInterface<TContext>
> extends BasePipeline<TContext> {
  /**
   * Pointer interface for lifting given middleware functions to a IntermediatePipeline.
   * @param middleware - n Middleware functions.
   */
  public static of<TContext, TWrapper extends IntermediateInterface<TContext> = IntermediateInterface<TContext>>(
    ...middleware: MiddlewareInterface<IntermediateInterface<TContext>>[]
  ): IntermediatePipeline<TContext> {
    return new IntermediatePipeline<TContext>(middleware);
  }

  /**
   * Pointer interface for creating a IntermediatePipeline from array of Middleware.
   * @param middleware - Array of Middleware functions.
   */
  public static from<TContext, TWrapper extends IntermediateInterface<TContext> = IntermediateInterface<TContext>>(
    middleware: MiddlewareInterface<IntermediateInterface<TContext>>[],
  ): IntermediatePipeline<TContext> {
    return new IntermediatePipeline<TContext>(middleware);
  }

  /**
   * Pointer interface for creating an empty IntermediatePipeline.
   */
  public static empty<TContext>(): IntermediatePipeline<TContext> {
    return new IntermediatePipeline<TContext>([]);
  }

  /**
   * @constructor
   * @param middleware - Array of Middleware functions.
   */
  public constructor(middleware: MiddlewareInterface<TWrapper>[]) {
    super(middleware as MiddlewareInterface<{}>[]);
  }

  /**
   * Sequentially call middleware functions stored inside IntermediatePipeline starting with context provided as an
   * argument. If `ctx` argument is not Intermediate, it is wrapped up with `Intermediate.of`.
   *
   * Values returned from middleware functions will be assigned to `ctx.intermediate`.
   *
   * If previous middleware function returned nullable value (**null** or **undefined**), the `ctx` object will be
   * passed to the next middleware unmodified.
   *
   * If middleware that is currently being processed returns a Promise, it will be resolved before being passed to
   * the next middleware.
   *
   * Returns Promise of contents of the `intermediate`. If error occurs during execution, it can be caught with
   * returned Promise `.catch`.
   *
   * @param ctx - `intermediate` contents or wrapper containing `intermediate`.
   */
  public async process(ctx: TContext | TWrapper): Promise<TContext> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: IntermediateInterface | any = typeof ctx == "object" && ctx != null ? { ...ctx } : ctx;

    if (!Intermediate.isIntermediate(result)) {
      result = Intermediate.of(result);
    }

    for (let i = 0; i < this._middleware.length; i++) {
      if (this._middleware[i] == null) {
        throw new TypeError("Middleware must be a function");
      }

      const done = await this._middleware[i](result);

      if (done != null) {
        result.intermediate = done;
      }
    }

    return result.intermediate;
  }
}
