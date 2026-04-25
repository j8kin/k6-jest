import type { Options } from 'k6/options';
import type { TestSuite } from './types.ts';

export const suiteOptions = (suite: TestSuite, overrides?: Partial<Options>): Options => ({
  vus: 1,
  iterations: 1,
  thresholds: { checks: ['rate==1.0'] },
  ...overrides,
});

export const mergeSuites = (...suites: TestSuite[]): TestSuite => ({
  name: 'merged',
  get testCount() {
    return suites.reduce((n, s) => n + s.testCount, 0);
  },

  async run() {
    for (const s of suites) await s.run();
  },
});
