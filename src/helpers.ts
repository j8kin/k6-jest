import type { Options } from 'k6/options';
import type { TestSuite } from './types.ts';

export function suiteOptions(suite: TestSuite, overrides?: Partial<Options>): Options {
  return {
    vus: 1,
    iterations: 1,
    thresholds: { checks: ['rate==1.0'] },
    ...overrides,
  };
}

export function mergeSuites(...suites: TestSuite[]): TestSuite {
  return {
    name: 'merged',
    get testCount() { return suites.reduce((n, s) => n + s.testCount, 0); },
    async run() { for (const s of suites) await s.run(); },
  };
}
