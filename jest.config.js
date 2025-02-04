module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/test"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  setupFilesAfterEnv: ["jest-extended", "./test/setup.ts"],
  collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}", "!src/**/*.d.ts"],
  moduleNameMapper: {
    electron: "<rootDir>/test/__mocks__/electronMock.js",
    consts: "<rootDir>/src/consts.ts",
    "^store/(.*)$": "<rootDir>/src/store/$1",
    "^components/(.*)$": "<rootDir>/src/components/$1",
    "^lib/(.*)$": "<rootDir>/src/lib/$1",
    "^ui(.*)$": "<rootDir>/src/components/ui/$1",
    "^renderer(.*)$": "<rootDir>/src/renderer/$1",
    "^shared(.*)$": "<rootDir>/src/shared/$1",
    "^!!raw-loader!(.*)\\.css$": "<rootDir>/test/__mocks__/styleMock.js",
  },
};
