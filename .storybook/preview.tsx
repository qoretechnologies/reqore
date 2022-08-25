import { withTests } from '@storybook/addon-jest';
import { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import results from '../tests.json';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  layout: 'fullscreen',
  options: {
    enableShortcuts: false,
    panelPosition: 'right',
    sidebar: {
      showRoots: true,
    },
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
    hideNoControlsWarning: true,
    expanded: true,
  },
};

export const argTypes = {
  mainTheme: {
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
};

export const decorators = [
  (Story, context) => (
    <ReqoreUIProvider theme={{ main: context.args.mainTheme }}>
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
