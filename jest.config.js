module.exports = {
  // The root of your source code, typically /src
  // `<rootDir>` is a token Jest substitutes
  roots: ['<rootDir>/src'],

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

  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
};
