export type HookFn = () => void | Promise<void>;
export type TestFn = () => void | Promise<void>;

export interface TestSuite {
  readonly name: string;
  readonly testCount: number;
  run(): Promise<void>;
}

export interface DescribeFn {
  (name: string, fn: () => void): TestSuite;
  skip: (name: string, fn: () => void) => TestSuite;
}

export interface TestFnWithModifiers {
  (name: string, fn: TestFn): void;
  skip: (name: string, fn: TestFn) => void;
  only: (name: string, fn: TestFn) => void;
}

// Internal — not exported from index.ts
export interface SuiteNode {
  name: string;
  skipped: boolean;
  beforeAll: HookFn[];
  afterAll: HookFn[];
  beforeEach: HookFn[];
  afterEach: HookFn[];
  tests: TestNode[];
  children: SuiteNode[];
}

export interface TestNode {
  name: string;
  fn: TestFn;
  skipped: boolean;
  only: boolean;
}
