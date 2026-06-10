export default {
  testEnvironment: "node",
  transform: {},
  moduleDirectories: ["node_modules"], // standard
  verbose: false,
  setupFilesAfterEnv: ["./front_end/js/__tests__/setup.js"],
  testPathIgnorePatterns: ["/node_modules/", "setup.js"],
  collectCoverage: true,
  collectCoverageFrom: [
    "./front_end/js/**/*.js",
    "!./front_end/js/**/setup.js",
  ],
  coverageThreshold: {
    global: {
      lines: 90,
    },
  },
};
