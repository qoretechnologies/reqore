/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'docs/intro',
    {
      type: 'category',
      label: 'Guides',
      items: ['docs/guides/getting-started', 'docs/guides/theming', 'docs/guides/effects'],
    },
    {
      type: 'category',
      label: 'Components',
      items: [
        'docs/components/button',
        'docs/components/dropdown',
        'docs/components/panel',
        'docs/components/input',
        'docs/components/table',
      ],
    },
  ],
};

module.exports = sidebars;
