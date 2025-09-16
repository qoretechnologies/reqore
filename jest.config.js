module.exports = {
  // The root of your source code, typically /src
  // `<rootDir>` is a token Jest substitutes
  roots: ['<rootDir>/__tests__'],

  testMatch: ['<rootDir>/__tests__/**/*.test.(ts|tsx)'],

  // Use babel-jest to transform TS/JS so ESM deps (like nanoid) are transpiled for Jest
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },

  // Transform ESM packages that Jest can't run directly
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(yaml|nanoid)/)'],

  // Module file extensions for importing
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'css'],

  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/src/mock/styleMock.js',
  },

  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],

  silent: false,
  verbose: false,
  testEnvironment: 'jest-environment-jsdom',
};
