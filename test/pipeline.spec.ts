import { Pipeline } from "../src";

/* eslint-disable @typescript-eslint/explicit-function-return-type */

describe("Pipeline", () => {
  const mw1 = x => x + 1;
  const mw2 = x => x + 2;
  const mw3 = x => x + 3;
  const amw1 = (x: number): Promise<number> => new Promise(resolve => setTimeout(() => resolve(x + 4), 1));

  describe("pipe", () => {
    it("should allow extending Pipelines", async () => {
      expect(await Pipeline.from([amw1, mw1, mw2, mw3]).process(1)).toEqual(
        await Pipeline.of(amw1)
          .pipe(mw1)
          .pipe(mw2)
          .pipe(mw3)
          .process(1),
      );
    });
  });

  describe("process", () => {
    it("should consecutively run synchronous code", async () => {
      expect(await Pipeline.from([mw1, mw2, mw3]).process(1)).toEqual(7);
    });

    it("should consecutively run Promise-based code", async () => {
      expect(await Pipeline.from([amw1, mw1]).process(1)).toEqual(6);
      expect(await Pipeline.from([mw1, amw1]).process(1)).toEqual(6);
    });

    it("should shallow-copy context if it was an object", async () => {
      const int = { intermediate: 1 };
      expect(await Pipeline.from([amw1, mw1]).process(int)).not.toBe(int);
    });

    it("should shallow-copy context if it was an array", async () => {
      const test = [1, 2, 3];
      expect(await Pipeline.from([]).process(test)).toEqual(test);
      expect(await Pipeline.from([]).process(test)).not.toBe(test);
    });

    it("should do nothing if array of Middleware is empty", async () => {
      expect(await Pipeline.from([]).process(1)).toEqual(1);
    });

    it("should preserve context if nothing was returned", async () => {
      expect(await Pipeline.from<number, number>([() => {}, ctx => ctx + 1]).process(1)).toEqual(2);
    });

    it("should throw TypeError if pipeline was created with a non-function", async () => {
      try {
        await Pipeline.of(null).process((1 as unknown) as string);
      } catch (e) {
        expect(e).toBeInstanceOf(TypeError);
      }
    });

    it("should make a copy of process() argument for internal use", async () => {
      const ctx = { test: 1 };
      expect(Object.is(await Pipeline.of(ctx => ctx).process(ctx), ctx)).toEqual(false);
    });

    it("should refer to context as immutable outside pipeline", async () => {
      interface Testable {
        test: number;
      }
      const test: Testable = { test: 1 };
      await Pipeline.of((ctx: Testable) => {
        ctx.test = 2;
      }).process(test);
      expect(test.test).toEqual(1);
    });

    it("should throw error if the pipeline errored", async () => {
      try {
        await Pipeline.of<string, any>(ctx => ctx.toUpperCase()).process((1 as unknown) as string);
      } catch (e) {
        expect(e).toBeInstanceOf(TypeError);
      }
    });
  });

  describe("toArray", () => {
    it("should return internally stored middleware as array", () => {
      const arr = [x => x.intermediate + 2, x => x.intermediate + 3];

      expect(Pipeline.from(arr).toArray()).toEqual(arr);
    });
  });

  describe("isEmpty", () => {
    it("should be true if Pipeline has no middleware", () => {
      expect(Pipeline.empty().isEmpty).toEqual(true);
    });

    it("should be false if Pipeline has middleware", () => {
      expect(Pipeline.of(() => {}).isEmpty).toEqual(false);
    });
  });

  describe("Semigroup", () => {
    it("ASSOCIATIVITY a.concat(b).concat(c) is equivalent to a.concat(b.concat(c))", async () => {
      const a = Pipeline.of<number, number>(x => x + 1);
      const b = Pipeline.from<number, number>([x => x + 2]);
      const c = Pipeline.from<number, number>([x => x + 3]);

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
      const m = Pipeline.from<string, string>([x => Number.parseInt(x)]);
      expect(await m.concat(Pipeline.empty()).process("3")).toEqual(await m.process("3"));
    });

    it("LEFT IDENTITY M.empty().concat(m) is equivalent to m", async () => {
      const m = Pipeline.from<string, string>([x => Number.parseInt(x)]);
      expect(
        await Pipeline.empty()
          .concat(m)
          .process("3"),
      ).toEqual(await m.process("3"));
    });

    it("empty() is the same for instance and static methods", async () => {
      expect(Pipeline.empty()).toEqual(Pipeline.empty().empty());
    });
  });
});
