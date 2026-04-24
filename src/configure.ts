interface Config {
  nameSeparator: string;
  continueOnHookFailure: boolean;
  verbose: boolean;
}

let config: Config = { nameSeparator: ' > ', continueOnHookFailure: true, verbose: false };
let locked = false;

export function configure(overrides: Partial<Config>): void {
  if (locked) {
    console.warn('configure() called after describe()/run() — ignored');
    return;
  }
  config = { ...config, ...overrides };
}

export function getConfig(): Readonly<Config> { return config; }
export function lockConfig(): void { locked = true; }
