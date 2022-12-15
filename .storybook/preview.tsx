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
    pauseAnimationAtEnd: true,
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
  animatedButtons: {
    description: 'Whether to animate buttons on hover',
    name: 'Animated Buttons',
    defaultValue: true,
    type: 'boolean',
  },
  animatedDialogs: {
    description: 'Whether to animate dialogs on open',
    name: 'Animated Dialogs & Drawers',
    defaultValue: true,
    type: 'boolean',
  },
};

export const decorators = [
  (Story, context) =>
    context.args.withoutContent ? (
      <ReqoreUIProvider
        theme={{ main: context.args.mainTheme }}
        options={{
          animations: {
            buttons: context.args.animatedButtons,
            dialogs: context.args.animatedDialogs,
          },
        }}
      >
        <ReqoreLayoutContent>
          <Story />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    ) : (
      <ReqoreUIProvider
        theme={{ main: context.args.mainTheme }}
        options={{
          animations: {
            buttons: context.args.animatedButtons,
            dialogs: context.args.animatedDialogs,
          },
        }}
      >
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
