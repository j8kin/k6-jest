import { group, check } from 'k6';
import { getConfig } from './configure.ts';
import type { SuiteNode, TestNode, HookFn, TestSuite } from './types.ts';

async function safeRun(fn: () => void | Promise<void>): Promise<{ ok: boolean; error?: string }> {
  try { await fn(); return { ok: true }; }
  catch (e: unknown) { return { ok: false, error: e instanceof Error ? e.message : String(e) }; }
}

function resolveOnly(tests: TestNode[]): TestNode[] {
  return tests.some(t => t.only) ? tests.filter(t => t.only) : tests;
}

async function runHooks(hooks: HookFn[]): Promise<{ ok: boolean; error?: string }> {
  for (const h of hooks) {
    const r = await safeRun(h);
    if (!r.ok) return r;
  }
  return { ok: true };
}

interface CheckEntry {
  name: string;
  ok: boolean;
}

async function collectSuite(
  node: SuiteNode,
  parentPath: string,
  inheritedBeforeEach: HookFn[],
  inheritedAfterEach: HookFn[],
): Promise<{ path: string; entries: CheckEntry[] }[]> {
  const { nameSeparator } = getConfig();
  const fullPath = parentPath ? `${parentPath}${nameSeparator}${node.name}` : node.name;
  const allBeforeEach = [...inheritedBeforeEach, ...node.beforeEach];
  const allAfterEach  = [...node.afterEach, ...inheritedAfterEach]; // innermost-first

  if (node.skipped) return [];

  const entries: CheckEntry[] = [];
  const childGroups: { path: string; entries: CheckEntry[] }[] = [];

  const beforeAllResult = await runHooks(node.beforeAll);

  if (!beforeAllResult.ok) {
    for (const t of node.tests) {
      entries.push({
        name: `${fullPath}${nameSeparator}${t.name} [FAILED: beforeAll: ${beforeAllResult.error}]`,
        ok: false,
      });
    }
  } else {
    const tests = resolveOnly(node.tests);
    for (const t of tests) {
      if (t.skipped) continue;

      const beforeEachResult = await runHooks(allBeforeEach);
      const result = !beforeEachResult.ok
        ? { ok: false, error: `beforeEach: ${beforeEachResult.error}` }
        : await safeRun(t.fn);
      await runHooks(allAfterEach); // always runs

      entries.push({
        name: result.ok
          ? `${fullPath}${nameSeparator}${t.name}`
          : `${fullPath}${nameSeparator}${t.name} [FAILED: ${result.error}]`,
        ok: result.ok,
      });
    }

    for (const child of node.children) {
      const childResults = await collectSuite(child, fullPath, allBeforeEach, allAfterEach);
      childGroups.push(...childResults);
    }
  }

  await runHooks(node.afterAll);

  return [{ path: fullPath, entries }, ...childGroups];
}

function reportGroups(groups: { path: string; entries: CheckEntry[] }[]): void {
  // Report leaf groups first, building up from innermost to ensure correct nesting.
  // We report all as flat groups since k6 1.x does not support async group callbacks.
  for (const g of groups) {
    if (g.entries.length === 0) continue;
    group(g.path, () => {
      for (const e of g.entries) {
        const ok = e.ok;
        check(null, { [e.name]: () => ok });
      }
    });
  }
}

async function runSuite(node: SuiteNode): Promise<void> {
  const groups = await collectSuite(node, '', [], []);
  reportGroups(groups);
}

function countTests(node: SuiteNode): number {
  if (node.skipped) return 0;
  return node.tests.filter(t => !t.skipped).length
    + node.children.reduce((n, c) => n + countTests(c), 0);
}

export function buildTestSuite(node: SuiteNode): TestSuite {
  return {
    get name() { return node.name; },
    get testCount() { return countTests(node); },
    async run() { await runSuite(node); },
  };
}
