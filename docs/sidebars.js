/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Guides',
      items: ['guides/getting-started', 'guides/theming'],
    },
  ],
};

module.exports = sidebars;
