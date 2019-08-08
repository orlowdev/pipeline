import { BasePipeline } from "./base-pipeline";
import { MiddlewareInterface } from "./interfaces/middleware.interface";
import { IntermediateInterface } from "./interfaces/intermediate.interface";

/**
 * Pipeline is an inverted Monoid that stores an array of middleware functions to be applied to data passed as
 * pipeline.process() argument.
 *
 * **NOTE**: Pipeline creates a shallow copy of the context argument before passing it to the first middleware.
 */
export class Pipeline<TContext> extends BasePipeline<TContext> {
  /**
   * Pointer interface for lifting given middleware functions to a Pipeline.
   * @param middleware - n Middleware functions.
   */
  public static of<T>(...middleware: MiddlewareInterface<T>[]): Pipeline<T> {
    return new Pipeline<T>(middleware);
  }

  /**
   * Pointer interface for creating a Pipeline from array of Middleware.
   * @param middleware - Array of Middleware functions.
   */
  public static from<T>(middleware: MiddlewareInterface<T>[]): Pipeline<T> {
    return new Pipeline<T>(middleware);
  }

  /**
   * Pointer interface for creating an empty Pipeline.
   */
  public static empty<T>(): Pipeline<T> {
    return new Pipeline<T>([]);
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
  public async process(ctx: TContext): Promise<TContext> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: IntermediateInterface | any;

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
