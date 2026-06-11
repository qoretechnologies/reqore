import { setProjectAnnotations } from '@storybook/react-vite';
import { createElement } from 'react';
import { beforeAll } from 'vitest';
import * as previewAnnotations from './preview';

// Registers the React renderer (renderToCanvas) plus the project's global
// decorators/parameters from .storybook/preview for the Storybook Vitest project.
const annotations = setProjectAnnotations([
  previewAnnotations,
  {
    decorators: [
      // The vitest tester mounts stories into an auto-height <div> under <body>,
      // unlike the dev preview where .storybook/preview-body.html gives the
      // html/body/#storybook-root chain `height: 100%`. Without a definite
      // height, height-filling stories (`fill`, `fillParent`) cannot resolve
      // their 100% heights — the Table's fill measure loop never settles and
      // the story test times out. A 100vh frame resolves regardless of parent.
      (Story: any) => createElement('div', { style: { height: '100vh' } }, createElement(Story)),
    ],
  },
]);

beforeAll(annotations.beforeAll);

// Font parity with .storybook/preview-body.html.
const style = document.createElement('style');
style.textContent = `
  html,
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
`;
document.head.appendChild(style);
