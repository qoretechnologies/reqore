import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // The root of your source code, typically /src
  // `<rootDir>` is a token Jest substitutes
  roots: ['<rootDir>/__tests__'],

  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/__tests__/**/*.test.(ts|tsx)'],

  // Jest transformations -- this adds support for TypeScript
  // using ts-jest
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // Module file extensions for importing
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'css'],

  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/src/mock/styleMock.js',
  },

  setupFiles: ['<rootDir>/__tests__/setupTests.ts'],

  notify: true,
  notifyMode: 'always',

  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
};

export default config;
