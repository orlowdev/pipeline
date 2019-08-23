import { BasePipeline } from "./base-pipeline";
import { IntermediateInterface, MiddlewareInterface } from "./interfaces";
import { Intermediate } from "./helpers";

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
export class IntermediatePipeline<TContext, TResult, TReserved> extends BasePipeline<TContext, TResult, TReserved> {
  /**
   * Pointer interface for lifting given middleware functions to a IntermediatePipeline.
   * @param middleware - n Middleware functions.
   */
  public static of<
    TContext,
    TResult,
    TReserved = TContext extends IntermediateInterface<infer U>
      ? U | TContext
      : TContext | IntermediateInterface<TContext>
  >(
    middleware: MiddlewareInterface<
      TContext extends IntermediateInterface<infer U> ? IntermediateInterface<U> : IntermediateInterface<TContext>,
      TResult
    >,
  ): IntermediatePipeline<
    TContext extends IntermediateInterface<infer U> ? IntermediateInterface<U> : IntermediateInterface<TContext>,
    TResult extends Promise<infer U> ? U : TResult,
    TReserved
  > {
    // @ts-ignore
    return new IntermediatePipeline([middleware]);
  }

  /**
   * Pointer interface for creating a IntermediatePipeline from array of Middleware.
   * @param middleware - Array of Middleware functions.
   */
  public static from<
    TContext,
    TResult,
    TReserved = TContext extends IntermediateInterface<infer U> ? U | TContext : TContext
  >(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middleware: MiddlewareInterface<any, any>[],
  ): IntermediatePipeline<
    TContext extends IntermediateInterface<infer U> ? IntermediateInterface<U> : IntermediateInterface<TContext>,
    TResult extends Promise<infer U> ? U : TResult,
    TReserved
  > {
    return new IntermediatePipeline(middleware);
  }

  /**
   * Pointer interface for creating an empty IntermediatePipeline.
   */
  public static empty<TContext, TResult, TReserved>(): IntermediatePipeline<TContext, TResult, TReserved> {
    return new IntermediatePipeline([]);
  }

  /**
   * @constructor
   * @param middleware - Array of Middleware functions.
   */
  public constructor(middleware: MiddlewareInterface<TContext, TResult>[]) {
    super(middleware);
  }

  /**
   * Create new IntermediatePipeline containing Middleware functions of both current Pipeline and the Pipeline passed
   * as an
   * argument.
   * @param o
   */
  // @ts-ignore
  public concat<TNewResult>(
    o: IntermediatePipeline<
      TResult extends IntermediateInterface<infer U> ? IntermediateInterface<U> : IntermediateInterface<TResult>,
      TNewResult,
      TReserved
    >,
  ): IntermediatePipeline<
    TResult extends IntermediateInterface<infer U> ? IntermediateInterface<U> : IntermediateInterface<TResult>,
    TNewResult extends Promise<infer U> ? U : TNewResult,
    TReserved
  > {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return IntermediatePipeline.from(this.middleware.concat(o.middleware as MiddlewareInterface<any, any>[])) as any;
  }

  /**
   * Create a new Pipeline with Middleware provided as an argument appended to the end of the Middleware list.
   * @param middleware
   */
  // @ts-ignore
  public pipe<TNewResult>(
    middleware: MiddlewareInterface<
      TResult extends IntermediateInterface<infer U> ? IntermediateInterface<U> : IntermediateInterface<TResult>,
      TNewResult
    >,
  ): IntermediatePipeline<
    TResult extends IntermediateInterface<infer U> ? IntermediateInterface<U> : IntermediateInterface<TResult>,
    TNewResult extends Promise<infer U> ? U : TNewResult,
    TReserved
  > {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return IntermediatePipeline.from([...this.middleware, middleware]) as any;
  }

  /**
   * Sequentially call middleware functions stored inside IntermediatePipeline starting with context provided as an
   * argument. If `ctx` argument is not Intermediate, it is wrapped up with `Intermediate.of`.
   *
   * Values returned from middleware functions will be assigned to `ctx.intermediate`.
   *
   * If middleware that is currently being processed returns a Promise, it will be resolved before being passed to
   * the next middleware.
   *
   * Returns Promise of contents of the `intermediate`. If error occurs during execution, it can be caught with
   * returned Promise `.catch`.
   *
   * @param ctx - `intermediate` contents or wrapper containing `intermediate`.
   */
  public async process(ctx: TReserved): Promise<TResult> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: IntermediateInterface | any;

    if (typeof ctx != "object" || ctx == null) {
      result = ctx;
    } else {
      result = Array.isArray(ctx) ? [...ctx] : { ...ctx };
    }

    if (!Intermediate.isIntermediate(result)) {
      result = Intermediate.of(result);
    }

    for (let i = 0; i < this._middleware.length; i++) {
      if (this._middleware[i] == null) {
        throw new TypeError("Middleware must be a function");
      }

      result.intermediate = await this._middleware[i](result);
    }

    return result.intermediate;
  }
}
