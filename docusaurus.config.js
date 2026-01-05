// @ts-check

const { themes } = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Reqore',
  tagline: 'Highly theme-able and modular UI library for React',
  url: 'https://qoretechnologies.github.io',
  baseUrl: '/reqore/',
  onBrokenLinks: 'throw',
  markdown: {
    mermaid: true,
  },
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
  // TypeDoc plugin temporarily disabled due to compatibility issues
  // plugins: [
  //   [
  //     'docusaurus-plugin-typedoc',
  //     /** @type {import('docusaurus/plugin-typedoc').PluginOptions} */
  //     ({
  //       entryPoints: ['src/index.tsx'],
  //       tsconfig: 'tsconfig.prod.json',
  //       out: 'api',
  //     }),
  //   ],
  // ],
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
            href: 'https://github.com/qoretechnologies/reqore',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} Qore Technologies`.concat(
          ' Built with Docusaurus.'
        ),
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
