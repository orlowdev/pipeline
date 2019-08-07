import { SemigroupInterface } from "./semigroup.interface";

/**
 * **RIGHT IDENTITY** `m.concat(M.empty())` is equivalent to `m`.
 * **LEFT IDENTITY** `M.empty().concat(m)` is equivalent to `m`.
 *
 * `M.empty` must return a value of the same Monoid.
 */
export interface MonoidInterface<TValue> extends SemigroupInterface<TValue> {
  /**
   * empty :: `Monoid m => () -> m`
   * @returns {MonoidInterface<TValue>}
   */
  empty(): MonoidInterface<TValue>;
}

export interface MonoidStaticInterface {
  /**
   * empty :: `Monoid m => () -> m`
   * @returns {MonoidInterface<TValue>}
   */
  empty<T>(): MonoidInterface<T>;
}
