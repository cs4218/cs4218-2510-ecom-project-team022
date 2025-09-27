export default {
  displayName: "backend",
  testEnvironment: "node",
  testMatch: ["**/?(*.)+(test).[jt]s?(x)"],
  testPathIgnorePatterns: ["<rootDir>/client/"],
  collectCoverage: true,
  collectCoverageFrom: ["controllers/**", "routes/**", "middlewares/**", "helpers/**"],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
    },
  },
};
