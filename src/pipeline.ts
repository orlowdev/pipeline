import { BasePipeline } from "./base-pipeline";
import { MiddlewareInterface } from "./interfaces";

/**
 * Pipeline is an inverted Monoid that stores an array of middleware functions to be applied to data passed as
 * pipeline.process() argument.
 *
 * **NOTE**: Pipeline creates a shallow copy of the context argument before passing it to the first middleware.
 */
export class Pipeline<TContext, TResult, TReserved> extends BasePipeline<TContext, TResult, TReserved> {
  /**
   * Pointer interface for lifting given middleware function to a Pipeline.
   * @param middleware - n Middleware functions.
   */
  public static of<TContext, TResult, TReserved = TContext>(
    middleware: MiddlewareInterface<TContext, TResult>,
  ): Pipeline<TContext, TResult extends Promise<infer U> ? U : TResult, TReserved> {
    // @ts-ignore
    return new Pipeline<TContext, TResult extends Promise<infer U> ? U : TResult, TReserved>([middleware]);
  }

  /**
   * Pointer interface for creating a Pipeline from array of Middleware.
   * @param middleware - Array of Middleware functions.
   */
  public static from<TContext, TResult, TReserved = TContext>(
    middleware: MiddlewareInterface<any, any>[],
  ): Pipeline<TContext, TResult, TReserved> {
    return new Pipeline(middleware);
  }

  /**
   * Pointer interface for creating an empty Pipeline.
   */
  public static empty<TContext, TResult, TReserved>(): Pipeline<TContext, TResult, TReserved> {
    return new Pipeline([]);
  }

  /**
   * Create new Pipeline containing Middleware functions of both current Pipeline and the Pipeline passed as an
   * argument.
   * @param o
   */
  public concat<TNewResult>(
    o: Pipeline<TResult, TNewResult, TReserved>,
  ): Pipeline<TResult, TNewResult extends Promise<infer U> ? U : TNewResult, TReserved> {
    return Pipeline.from(this.middleware.concat(o.middleware as any) as any);
  }

  /**
   * Create a new Pipeline with Middleware provided as an argument appended to the end of the Middleware list.
   * @param middleware
   */
  public pipe<TNewResult>(
    middleware: MiddlewareInterface<TResult, TNewResult>,
  ): Pipeline<TResult, TNewResult extends Promise<infer U> ? U : TNewResult, TReserved> {
    return Pipeline.from([...this.middleware, middleware]);
  }

  /**
   * Sequentially call middleware functions stored inside Pipeline starting with context provided as an
   * argument.
   *
   * Values returned from middleware functions will be passed to the next middleware as an argument.
   *
   * If previous middleware function returned nullable value (**null** or **undefined**), the `ctx` will be
   * passed to the next middleware unmodified.
   *
   * If middleware that is currently being processed returns a Promise, it will be resolved before being passed to
   * the next middleware.
   *
   * Returns Promise of contents of the transformed context. If error occurs during execution, it can be caught with
   * returned Promise `.catch`.
   *
   * @param ctx
   */
  public async process(ctx: TReserved): Promise<TResult> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: TContext | any;

    if (typeof ctx != "object") {
      result = ctx;
    } else {
      result = Array.isArray(ctx) ? [...ctx] : { ...ctx };
    }

    for (let i = 0; i < this._middleware.length; i++) {
      if (this._middleware[i] == null) {
        throw new TypeError("Middleware must be a function");
      }

      const done = await this._middleware[i](result);

      if (done != null) {
        result = done;
      }
    }

    return result;
  }
}
