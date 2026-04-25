import { currentSuite } from './context.ts';
import type { HookFn } from './types.ts';

export const beforeAll = (fn: HookFn): void => {
  currentSuite().beforeAll.push(fn);
};
export const afterAll = (fn: HookFn): void => {
  currentSuite().afterAll.push(fn);
};
export const beforeEach = (fn: HookFn): void => {
  currentSuite().beforeEach.push(fn);
};
export const afterEach = (fn: HookFn): void => {
  currentSuite().afterEach.push(fn);
};
