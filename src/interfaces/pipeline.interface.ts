import { MiddlewareInterface } from "./middleware.interface";
import { MonoidInterface, MonoidStaticInterface } from "./monoid.interface";

/**
 * Descriptor for Pipeline.
 *
 * @interface PipelineInterface
 */
export interface PipelineInterface<TContext, TResult, TReserved> extends MonoidInterface<TContext> {
  /**
   * Pipeline has no middleware flag.
   */
  isEmpty: boolean;
  /**
   * Array of internally stored middleware.
   */
  middleware: MiddlewareInterface<TContext, TResult>[];

  /**
   * Concat current middleware with argument pipeline of the same generic type.
   * @param o
   */
  concat<TNewResult>(o: PipelineInterface<TResult, TNewResult, TReserved>);

  /**
   * Create a new PipelineInterface with Middleware provided as an argument appended to the end of the Middleware list.
   * @param middleware
   */
  pipe<TNewResult>(middleware: MiddlewareInterface<TResult, TNewResult>);

  /**
   * Sequentially call middleware functions stored inside Pipeline starting with context provided as an argument.
   * @param ctx
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  process(ctx: TReserved): any;
}

/**
 * Descriptor for static fields of PipelineInterface.
 *
 * @interface PipelineStaticInterface
 */
export interface PipelineStaticInterface extends MonoidStaticInterface {
  /**
   * Pointer interface for creating a Pipeline from array of Middleware.
   * @param middleware - Array of Middleware functions.
   */
  from<T, K, V>(middleware: MiddlewareInterface<T, K>[]): PipelineInterface<T, K, V>;

  /**
   * Pointer interface for lifting given middleware functions to a Pipeline.
   * @param middleware - n Middleware functions.
   */
  of<T, K, V>(middleware: MiddlewareInterface<T, K>): PipelineInterface<T, K, V>;

  /**
   * Pointer interface for creating an empty IntermediatePipeline.
   */
  empty(): PipelineInterface<unknown, unknown, unknown>;
}
