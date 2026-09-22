// @vitest-environment node
//
// Server rendering. These run WITHOUT jsdom on purpose: a real server has no
// `window`, no `document`, and refs never attach. Anything in the provider
// path that assumes a browser at render time shows up here as a thrown
// error or as missing output.
import { renderToString } from 'react-dom/server';
import { ServerStyleSheet } from 'styled-components';
import { expect, test } from 'vitest';
import { ReqoreDrawer, ReqoreTier, ReqoreUIProvider } from '../src';

const ssr = (ui: React.ReactElement): string => {
  const sheet = new ServerStyleSheet();
  try {
    return renderToString(sheet.collectStyles(ui));
  } finally {
    sheet.seal();
  }
};

test('ReqoreUIProvider emits its children on the server', () => {
  const html = ssr(
    <ReqoreUIProvider>
      <p>ssr-child-marker</p>
    </ReqoreUIProvider>
  );

  expect(html).toContain('ssr-child-marker');
  expect(html).toContain('reqore-portal');
});

test('a Tier inside the provider renders its content on the server', () => {
  const html = ssr(
    <ReqoreUIProvider>
      <ReqoreTier
        name='Team'
        price={49}
        currency='€'
        featureList={[{ content: 'tier-feature-marker' }]}
      />
    </ReqoreUIProvider>
  );

  expect(html).toContain('Team');
  expect(html).toContain('tier-feature-marker');
});

test('a closed Drawer in the tree does not break server rendering', () => {
  // Portals are unsupported by the server renderer; a closed drawer must
  // contribute nothing rather than throw.
  const html = ssr(
    <ReqoreUIProvider>
      <p>before-drawer</p>
      <ReqoreDrawer isOpen={false} label='Hidden'>
        drawer-body
      </ReqoreDrawer>
    </ReqoreUIProvider>
  );

  expect(html).toContain('before-drawer');
  expect(html).not.toContain('drawer-body');
});
