export type MobileEnvironment = {
  apiBaseUrl: string | undefined;
  useMockData: boolean;
};

// Feature code consumes this centralized value rather than hard-coding an API
// endpoint. Build tooling will inject OTH_API_BASE_URL for each environment.
const buildEnvironment = globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};

export const mobileEnvironment: MobileEnvironment = {
  apiBaseUrl: buildEnvironment.process?.env?.OTH_API_BASE_URL,
  // Until the first-party API is configured, development uses deterministic
  // fixtures by default. Release builds can never opt into this path.
  useMockData: __DEV__ && buildEnvironment.process?.env?.OTH_USE_MOCK_DATA !== "0"
};
