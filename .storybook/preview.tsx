import { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import withMockdate from '@netsells/storybook-mockdate';

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
    delay: 500,
    pauseAnimationAtEnd: true,
    viewports: [600, 1440],
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
  otherThemeOptions: {
    table: {
      disable: true,
    },
  },
};

export const decorators = [
  withMockdate,
  (Story, context) =>
    context.args.withoutContent ? (
      <ReqoreUIProvider
        theme={{ main: context.args.mainTheme, ...context.args.otherThemeOptions }}
        options={{
          animations: {
            buttons: context.args.animatedButtons,
            dialogs: context.args.animatedDialogs,
          },
          uiScale: context.args.globalUiScale,
        }}
      >
        <ReqoreLayoutContent style={{ height: '100%' }}>
          <Story />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    ) : (
      <ReqoreUIProvider
        theme={{ main: context.args.mainTheme, ...context.args.otherThemeOptions }}
        options={{
          animations: {
            buttons: context.args.animatedButtons,
            dialogs: context.args.animatedDialogs,
          },
          uiScale: context.args.globalUiScale,
        }}
      >
        <ReqoreLayoutContent>
          <ReqoreContent
            style={{
              padding: '20px',
              height: '100%',
              transform: `scale(${context.args.globalUiScale || 1})`,
            }}
          >
            <Story />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    ),
];
