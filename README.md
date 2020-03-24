# @priestine/pipeline

`@priestine/pipeline` is a set of inverted monoids which are built from a composition of handlers called **middleware** and a data entry point called **process**.

The main goal of this package is a proof of concept that simplified representation of functional composition can lower the functional programming entry level. It also abstracts asynchrony by resolving Promises passed from one middleware to another.

The _Pipeline_ can be concatenated with other _Pipelines_ with `concat` which enables multiple sets of middleware to be composed together.

## Features

- Composition of pipelines via `concat`
- Promise returned by middleware within _Pipeline_ is resolved before being passed as an argument to the next middleware
- If middleware returns `undefined` or `null`, result of previous computation is passed to the next middleware
- _Pipeline_ is a **Semigroup** (associativity) with `p.concat(o)`
- _Pipeline_ is a **Monoid** (right identity and left identity) with `p.empty()` and `P.empty()`

## Installation

```bash
npm i -S @priestine/pipeline
```

## Usage

### Pipeline

#### Node.js

```typescript
import { Pipeline } from "@priestine/pipeline";
import * as readline from "readline";

const addSpaceIfMissing = question => (question.charAt(question.length - 1) == " " ? question : question.concat(" "));
const transformToContextObject = question => ({ question });
const createReadlineInterface = ctx => ({
  ...ctx,
  rl: readline.createInterface(process.stdin, process.stdout),
});
const askQuestionAsync = ({ rl, question }) =>
  new Promise(res => rl.question(question, (answer: string) => res(answer)));
const makeAnswerGreen = (answer: string) => `\x1b[32m${answer}\x1b[0m`;
const logToConsole = (answer: string) => console.log(answer);
const exit = () => process.exit(0);

Pipeline.from([
  addSpaceIfMissing,
  transformToContextObject,
  createReadlineInterface,
  askQuestionAsync,
  makeAnswerGreen,
  logToConsole,
])
  .process("What is the answer to life, the universe and everything?")
  .then(exit);
```

#### Browser

```typescript
import { Pipeline } from "@priestine/pipeline";

const isOdd = (num: number) => num % 2 == 0;
const negate = (f: Function) => (x: any) => !f(x);
const mockFetch = (x: string): Promise<number[]> => new Promise(resolve => resolve([1, 2, 3, 4, 5]));
const filterOutOddNumbers = (nums: number[]): number[] => nums.filter(negate(isOdd));
const logToConsole = (answer: number[]): void => console.log(answer);

Pipeline.of(mockFetch)
  .pipe(filterOutOddNumbers)
  .pipe(logToConsole)
  .process("https://example.com/arbitrary-numbers")
  .catch(console.error);
```
