import { currentSuite } from './context.ts';
import type { TestFn, TestFnWithModifiers } from './types.ts';

function registerTest(name: string, fn: TestFn, skipped = false, only = false): void {
  currentSuite().tests.push({ name, fn, skipped, only });
}

export const test: TestFnWithModifiers = Object.assign(
  (name: string, fn: TestFn) => registerTest(name, fn),
  {
    skip: (name: string, fn: TestFn) => registerTest(name, fn, true, false),
    only: (name: string, fn: TestFn) => registerTest(name, fn, false, true),
  }
);

export const it: TestFnWithModifiers = test;
