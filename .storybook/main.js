const path = require('path');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-outline',
    'storybook-dark-mode',
    '@storybook/addon-jest',
    {
      name: '@storybook/addon-storysource',
      options: {
        rule: {
          test: [/\.stories\.tsx?$/],
          include: [path.resolve(__dirname, '../src')],
          use: [
            {
              loader: require.resolve('@storybook/source-loader'),
              options: { parser: 'typescript' },
            },
          ],
        },
        /**
         * Adding a loader to the webpack config. This loader will run prettier on all js files
        before they are loaded into the browser.
         */
        loaderOptions: {
          prettierConfig: { printWidth: 80, singleQuote: true },
        },
      },
    },
  ],
};
