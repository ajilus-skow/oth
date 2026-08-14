export type MobileEnvironment = {
  useMockData: boolean;
};

const buildEnvironment = globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};

export const mobileEnvironment: MobileEnvironment = {
  // Development fixtures are explicit and release builds can never opt in.
  useMockData: __DEV__ && buildEnvironment.process?.env?.OTH_USE_MOCK_DATA !== "0"
};
