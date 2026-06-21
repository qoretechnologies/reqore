module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react/recommended', 'plugin:react/jsx-runtime', 'plugin:storybook/recommended'],
  overrides: [
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
  },
  // Ignore storybook files
  ignorePatterns: ['**/stories/*', '**/mock/*'],
};
