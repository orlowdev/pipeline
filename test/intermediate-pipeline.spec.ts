import { IntermediateInterface, IntermediatePipeline } from "../src";

/* eslint-disable @typescript-eslint/explicit-function-return-type */

describe("IntermediatePipeline", () => {
  describe("process", () => {
    const mw1 = x => x.intermediate + 1;
    const mw2 = x => x.intermediate + 2;
    const mw3 = x => x.intermediate + 3;
    const callback = x => (resolve: Function) => setTimeout(() => resolve(x.intermediate + 4), 0);
    const amw1 = x => new Promise(callback(x));

    it("should consecutively run synchronous code", async () => {
      expect(await IntermediatePipeline.from([mw1, mw2, mw3]).process(1)).toEqual(7);
    });

    it("should consecutively run Promise-based code", async () => {
      expect(await IntermediatePipeline.from([amw1, mw1]).process(1)).toEqual(6);
      expect(await IntermediatePipeline.from([mw1, amw1]).process(1)).toEqual(6);
    });

    it("should shallow-copy context if it was an object", async () => {
      const int = { intermediate: 1 };
      expect(await IntermediatePipeline.from([amw1, mw1]).process(int)).not.toBe(int);
    });

    it("should shallow-copy context if it was an array", async () => {
      const test = [1, 2, 3];
      expect(await IntermediatePipeline.from([]).process(test)).toEqual(test);
      expect(await IntermediatePipeline.from([]).process(test)).not.toBe(test);
    });

    it("should refer to values of properties other than intermediate as immutable outside pipeline", async () => {
      type Testable = IntermediateInterface<number> & { test: number };
      const ctx: Testable = { test: 1, intermediate: 0 };
      await IntermediatePipeline.of((ctx: Testable) => {
        ctx.test = 2;
      }).process(ctx);
      expect(ctx.test).toEqual(1);
    });

    it("should do nothing if array of Middleware is empty", async () => {
      expect(await IntermediatePipeline.from([]).process(1)).toEqual(1);
    });

    it("should preserve context if nothing was returned", async () => {
      expect(await IntermediatePipeline.from([() => {}]).process(1)).toEqual(1);
    });

    it("should throw TypeError if pipeline was created with a non-function", async () => {
      try {
        await IntermediatePipeline.of(null).process((1 as unknown) as string);
      } catch (e) {
        expect(e).toBeInstanceOf(TypeError);
      }
    });

    it("should throw error if the pipeline errored", async () => {
      try {
        await IntermediatePipeline.of<string, any>(ctx => ctx.intermediate.toUpperCase()).process(
          (1 as unknown) as string,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(TypeError);
      }
    });
  });

  describe("toArray", () => {
    it("should return internally stored middleware as array", () => {
      const arr = [x => x.intermediate + 2, x => x.intermediate + 3];

      expect(IntermediatePipeline.from(arr).toArray()).toEqual(arr);
    });
  });

  describe("isEmpty", () => {
    it("should be true if IntermediatePipeline has no middleware", () => {
      expect(IntermediatePipeline.empty().isEmpty).toEqual(true);
    });

    it("should be false if IntermediatePipeline has middleware", () => {
      expect(IntermediatePipeline.of(() => {}).isEmpty).toEqual(false);
    });
  });

  describe("Semigroup", () => {
    it("ASSOCIATIVITY a.concat(b).concat(c) is equivalent to a.concat(b.concat(c))", async () => {
      const a = IntermediatePipeline.of<number, number>(x => x.intermediate + 1);
      const b = IntermediatePipeline.from<number, number>([x => x.intermediate + 2]);
      const c = IntermediatePipeline.from<number, number>([x => x.intermediate + 3]);

      expect(
        await a
          .concat(b)
          .concat(c)
          .process(1),
      ).toEqual(await a.concat(b.concat(c)).process(1));
    });
  });

  describe("Monoid", () => {
    it("RIGHT IDENTITY m.concat(M.empty()) is equivalent to m", async () => {
      const m = IntermediatePipeline.from<string, string>([x => Number.parseInt(x.intermediate)]);
      expect(await m.concat(IntermediatePipeline.empty()).process("3")).toEqual(await m.process("3"));
    });

    it("LEFT IDENTITY M.empty().concat(m) is equivalent to m", async () => {
      const m = IntermediatePipeline.from<string, string>([x => Number.parseInt(x.intermediate)]);
      expect(
        await IntermediatePipeline.empty()
          .concat(m)
          .process("3"),
      ).toEqual(await m.process("3"));
    });

    it("empty() is the same for instance and static methods", async () => {
      expect(IntermediatePipeline.empty()).toEqual(IntermediatePipeline.empty().empty());
    });
  });
});
