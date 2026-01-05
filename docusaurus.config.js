// @ts-check

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Reqore',
  tagline: 'Highly theme-able and modular UI library for React',
  url: 'https://qoretechnologies.github.io',
  baseUrl: '/reqore/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  organizationName: 'qoretechnologies',
  projectName: 'reqore',
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./docs/sidebars.js'),
          routeBasePath: '/',
          editUrl: 'https://github.com/qoretechnologies/reqore/edit/main/',
        },
        theme: {
          customCss: require.resolve('./docs/src/css/custom.css'),
        },
      }),
    ],
  ],
  themes: [
    [
      'docusaurus-plugin-typedoc',
      /** @type {import('docusaurus-plugin-typedoc').PluginOptions} */
      ({
        entryPoints: ['src/index.tsx'],
        tsconfig: 'tsconfig.prod.json',
        out: 'api',
        plugin: ['typedoc-plugin-markdown'],
        readme: 'none',
        entryDocument: 'api/index.md',
        sidebar: {
          categoryLabel: 'API Reference',
        },
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Reqore',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Docs',
          },
          {
            to: '/api',
            label: 'API',
            position: 'left',
          },
          {
            href: 'https://github.com/qoretechnologies/reqore',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} Qore Technologies`.
          concat(' Built with Docusaurus.'),
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
