import { withTests } from '@storybook/addon-jest';
import { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import { TSizes } from '../src/constants/sizes';
import results from '../tests.json';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  layout: 'fullscreen',
  controls: {
    expanded: true,
  },
};

export const argTypes = {
  theme: {
    control: 'color',
    description: 'The overall theme for all ReQore components',
    name: 'Main Theme',
    defaultValue: '#333333',
    table: {
      type: {
        summary: 'hex color of 6 characters',
      },
      defaultValue: { summary: '#333333' },
    },
  },
  customTheme: {
    control: 'color',
    description: 'The theme just for the current component',
    name: 'Component Theme',
    table: {
      type: {
        summary: 'hex color of 6 characters',
      },
    },
  },
  size: {
    control: 'select',
    description: 'The size of the element',
    options: ['tiny', 'small', 'normal', 'big', 'huge'] as TSizes[],
    name: 'Size',
    defaultValue: 'normal' as TSizes,
    table: {
      defaultValue: { summary: 'normal' },
    },
  },
};

export const decorators = [
  (Story, context) => (
    <ReqoreUIProvider theme={{ main: context.args.theme }}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ padding: '20px' }}>
          <Story />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  ),
  withTests({
    results,
  }),
];
