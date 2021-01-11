module.exports = {
  // The root of your source code, typically /src
  // `<rootDir>` is a token Jest substitutes
  roots: ['<rootDir>/__tests__'],

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

  notify: true,
  notifyMode: 'always',

  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
};
