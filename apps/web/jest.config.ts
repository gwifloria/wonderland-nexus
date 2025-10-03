// jest.config.ts
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|sass|scss)$": "identity-obj-proxy", // 可选：避免样式导入报错
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/e2e/",
    "<rootDir>/playwright/",
  ],
};

export default createJestConfig(customJestConfig);
