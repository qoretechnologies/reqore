import { withTests } from '@storybook/addon-jest';
import { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import results from '../tests.json';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  layout: 'fullscreen',
  options: {
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
  chromatic: {
    delay: 3000,
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
};

export const decorators = [
  (Story, context) =>
    context.args.withoutContent ? (
      <ReqoreUIProvider theme={{ main: context.args.mainTheme }}>
        <ReqoreLayoutContent>
          <Story />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    ) : (
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
