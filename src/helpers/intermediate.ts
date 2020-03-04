import { IntermediateInterface } from "../interfaces";
import { isIntermediate } from "./is-intermediate";

export class Intermediate<T = {}> implements IntermediateInterface {
  public static of<T>(value: T): Intermediate<T> {
    return new Intermediate(value);
  }

  public static isIntermediate(x: unknown): x is IntermediateInterface {
    return isIntermediate(x);
  }

  public intermediate: T;

  public constructor(value: T) {
    this.intermediate = value;
  }
}
