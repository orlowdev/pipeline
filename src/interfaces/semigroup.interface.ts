/**
 * **ASSOCIATIVITY** `a.concat(b).concat(c)` is equivalent to `a.concat(b.concat(c))`.
 *
 * `b` must be a value fo the same Semigroup. If `b` is not the same semigroup, behaviour of `concat` is unspecified.
 * `concat` must return a value fo the same Semigroup.
 */
export interface SemigroupInterface<TValue> {
  /**
   * concat :: `Semigroup a => a ~> a -> a`
   * @param {TSemigroup} x
   * @returns {SemigroupInterface<TValue>}
   */
  concat(x: SemigroupInterface<TValue>): SemigroupInterface<TValue>;
}
