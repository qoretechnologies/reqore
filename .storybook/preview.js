import { withTests } from '@storybook/addon-jest';
import results from '../.jest-test-results.json';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  layout: 'fullscreen',
};

export const decorators = [
  withTests({
    results,
  }),
];
