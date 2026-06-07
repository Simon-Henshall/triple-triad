export default {
  testEnvironment: "node",
  transform: {},
  moduleDirectories: ["node_modules"], // standard
  verbose: true,
  setupFilesAfterEnv: ["./front_end/js/__tests__/setup.js"],
  testPathIgnorePatterns: ["/node_modules/", "setup.js"],
};
