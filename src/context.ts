import type { SuiteNode } from './types.ts';

const _stack: SuiteNode[] = [];

export function pushSuite(node: SuiteNode): void { _stack.push(node); }
export function popSuite(): void { _stack.pop(); }

export function currentSuite(): SuiteNode {
  if (_stack.length === 0)
    throw new Error('beforeEach/afterEach/beforeAll/afterAll/test must be called inside a describe() callback');
  return _stack[_stack.length - 1];
}

export function peekParent(): SuiteNode | undefined {
  return _stack.length > 0 ? _stack[_stack.length - 1] : undefined;
}
