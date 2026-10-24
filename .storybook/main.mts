import type { StorybookConfig } from '@storybook/react-vite';
import { hostname } from 'node:os';

/** The machine Storybook runs on, by its full name and its first label (`host.example.com`, `host`). */
const thisMachine = (): string[] => {
  const name = hostname().toLowerCase();
  return [...new Set([name, name.split('.')[0]])].filter(Boolean);
};

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-docs', '@storybook/addon-vitest'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: { reactDocgen: false },
  core: {
    // The names a browser may reach this Storybook by: this machine's own, and localhost (an IP address always
    // may). Served on every interface (`--host 0.0.0.0`), it answers a page that names another host with "Invalid
    // host", so a site that rebinds its own name to this machine cannot read it.
    allowedHosts: ['localhost', ...thisMachine()],
  },
};

export default config;
