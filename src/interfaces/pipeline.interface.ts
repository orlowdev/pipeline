import { MiddlewareInterface } from "./middleware.interface";
import { MonoidInterface, MonoidStaticInterface } from "./monoid.interface";

export interface PipelineInterface<TContext = {}> extends MonoidInterface<TContext> {
  isEmpty: boolean;
  middleware: MiddlewareInterface<TContext>[];
  concat(o: PipelineInterface<TContext>): PipelineInterface<TContext>;
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
