import { peekParent, pushSuite, popSuite } from './context.ts';
import { lockConfig } from './configure.ts';
import { buildTestSuite } from './runner.ts';
import type { SuiteNode, DescribeFn, TestSuite } from './types.ts';

const createNode = (name: string, skipped: boolean, fn: () => void): TestSuite => {
  lockConfig();
  const parent = peekParent();

  const node: SuiteNode = {
    name,
    skipped,
    beforeAll: [],
    afterAll: [],
    beforeEach: [],
    afterEach: [],
    tests: [],
    children: [],
  };

  if (parent) parent.children.push(node);

  pushSuite(node);
  fn();
  popSuite();

  return buildTestSuite(node);
};

export const describe: DescribeFn = Object.assign((name: string, fn: () => void) => createNode(name, false, fn), {
  skip: (name: string, fn: () => void) => createNode(name, true, fn),
});
