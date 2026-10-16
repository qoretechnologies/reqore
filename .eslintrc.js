module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react/recommended', 'plugin:react/jsx-runtime', 'plugin:storybook/recommended'],
  overrides: [
    {
      // Stories are not shipped; the helper wraps styled-components' own `styled`.
      files: ['src/stories/**', 'src/helpers/styled.ts'],
      rules: { 'no-restricted-imports': 'off' },
    },
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'linebreak-style': ['error', 'unix'],
    semi: ['error', 'always'],
    '@typescript-eslint/no-explicit-any': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    'no-extra-boolean-cast': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    // Allow the "omit a key" idiom — `const { dropped, ...rest } = obj` — where
    // the destructured sibling is intentionally discarded.
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    // Reqore's `styled` (src/helpers/styled.ts) keeps styling props that are also HTML attribute
    // names (`size`, `disabled`, `checked`, ...) off the elements they are not attributes of.
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'styled-components',
            importNames: ['default'],
            message: "Import `styled` from 'src/helpers/styled' (it filters DOM props).",
          },
        ],
      },
    ],
  },
  // Ignore storybook files
  ignorePatterns: ['**/stories/*', '**/mock/*'],
};
