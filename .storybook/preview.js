import { withTests } from '@storybook/addon-jest';
// @ts-expect-error
import results from '../tests.json';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  layout: 'fullscreen',
};

export const decorators = [
  withTests({
    results,
  }),
];
