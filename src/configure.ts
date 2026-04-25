interface Config {
  nameSeparator: string;
  continueOnHookFailure: boolean;
  verbose: boolean;
}

let config: Config = {
  nameSeparator: ' > ',
  continueOnHookFailure: true,
  verbose: false,
};

let locked = false;

export const configure = (overrides: Partial<Config>): void => {
  if (locked) {
    console.warn('configure() called after describe()/run() — ignored');
    return;
  }
  config = { ...config, ...overrides };
};

export const getConfig = (): Readonly<Config> => config;

export const lockConfig = (): void => {
  locked = true;
};
