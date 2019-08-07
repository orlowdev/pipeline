import { MiddlewareInterface } from "./middleware.interface";
import { MonoidInterface, MonoidStaticInterface } from "./monoid.interface";

/**
 * Descriptor for Pipeline.
 *
 * @interface PipelineInterface
 */
export interface PipelineInterface<TContext = {}> extends MonoidInterface<TContext> {
  /**
   * Pipeline has no middleware flag.
   */
  isEmpty: boolean;
  /**
   * Array of internally stored middleware.
   */
  middleware: MiddlewareInterface<TContext>[];

  /**
   * Concat current middleware with argument pipeline of the same generic type.
   * @param o
   */
  concat(o: PipelineInterface<TContext>): PipelineInterface<TContext>;

  /**
   * Sequentially call middleware functions stored inside Pipeline starting with context provided as an argument.
   * @param ctx
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  process(ctx: TContext): any;
}

/**
 * Descriptor for static fields of PipelineInterface.
 *
 * @interface PipelineStaticInterface
 */
export interface PipelineStaticInterface<T = {}> extends MonoidStaticInterface {
  /**
   * Pointer interface for creating a Pipeline from array of Middleware.
   * @param middleware - Array of Middleware functions.
   */
  from<T>(middleware: MiddlewareInterface<T>[]): PipelineInterface<T>;

  /**
   * Pointer interface for lifting given middleware functions to a Pipeline.
   * @param middleware - n Middleware functions.
   */
  of<T>(...middleware: MiddlewareInterface<T>[]): PipelineInterface<T>;

  /**
   * Pointer interface for creating an empty IntermediatePipeline.
   */
  empty<T>(): PipelineInterface<T>;
}
