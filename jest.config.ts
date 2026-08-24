export default {
  testEnvironment: "node",
  preset: "ts-jest/presets/default-esm",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true, diagnostics: false }],
  },
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "mjs"],
  moduleDirectories: ["node_modules"], // standard
  verbose: false,
  setupFilesAfterEnv: ["./front_end/js/__tests__/setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "setup.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "./front_end/js/**/*.ts",
    "!./front_end/js/**/setup.ts",
    "!./front_end/js/**/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
};
