module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
  ],
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
  },
  // Ignore storybook files
  ignorePatterns: ['**/stories/*', '**/mock/*'],
};
