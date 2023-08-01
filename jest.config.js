module.exports = {
  // The root of your source code, typically /src
  // `<rootDir>` is a token Jest substitutes
  roots: ['<rootDir>/__tests__'],

  testMatch: ['<rootDir>/__tests__/**/*.test.(ts|tsx)'],

  // Jest transformations -- this adds support for TypeScript
  // using ts-jest
  transform: {
    '^.+\\.(ts|tsx|js)?$': ['ts-jest', { diagnostics: false }],
  },

  transformIgnorePatterns: ['<rootDir>/node_modules/(?!(yaml)/)'],

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
