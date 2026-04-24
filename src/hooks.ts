import { currentSuite } from './context.ts';
import type { HookFn } from './types.ts';

export function beforeAll(fn: HookFn): void  { currentSuite().beforeAll.push(fn); }
export function afterAll(fn: HookFn): void   { currentSuite().afterAll.push(fn); }
export function beforeEach(fn: HookFn): void { currentSuite().beforeEach.push(fn); }
export function afterEach(fn: HookFn): void  { currentSuite().afterEach.push(fn); }
