import { fireEvent, render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqorePanel, ReqoreUIProvider } from '../src';
import { IReqorePanelProps } from '../src/components/Panel';

const COVER = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E';

const renderPanel = (props: Partial<IReqorePanelProps>) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqorePanel label='Card' bottomActions={[{ label: 'Open' }]} {...props}>
            Content
          </ReqorePanel>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const panel = () => document.querySelector('.reqore-panel') as HTMLElement;
const media = () => document.querySelector('.reqore-panel-media') as HTMLElement;
const PARTS = [
  'reqore-panel-media',
  'reqore-panel-title',
  'reqore-panel-content',
  'reqore-panel-bottom-actions',
];

/** The panel's own children, in order, by the part each one is: where the media sits. */
const layout = () =>
  Array.from(panel().children).map(
    (child) => PARTS.find((name) => child.classList.contains(name)) ?? child.tagName
  );

test('A panel without media renders no frame', () => {
  renderPanel({});

  expect(media()).toBeNull();
  expect(layout()).toEqual([
    'reqore-panel-title',
    'reqore-panel-content',
    'reqore-panel-bottom-actions',
  ]);
});

test('A media URL renders a decorative image in a frame above the title bar', () => {
  renderPanel({ media: COVER });

  expect(layout()).toEqual([
    'reqore-panel-media',
    'reqore-panel-title',
    'reqore-panel-content',
    'reqore-panel-bottom-actions',
  ]);

  const image = media().querySelector('img') as HTMLImageElement;

  expect(image.getAttribute('src')).toBe(COVER);
  expect(image.getAttribute('alt')).toBe('');
  expect(getComputedStyle(image).display).toBe('block');
  expect(getComputedStyle(image).width).toBe('100%');
});

test('mediaAlt is the image text', () => {
  renderPanel({ media: COVER, mediaAlt: 'An operator at a dashboard' });

  expect(media().querySelector('img').getAttribute('alt')).toBe('An operator at a dashboard');
});

test('mediaPosition="bottom" puts the frame under everything', () => {
  renderPanel({ media: COVER, mediaPosition: 'bottom' });

  expect(layout()).toEqual([
    'reqore-panel-title',
    'reqore-panel-content',
    'reqore-panel-bottom-actions',
    'reqore-panel-media',
  ]);
  expect(media().classList.contains('reqore-panel-media-bottom')).toBe(true);
});

test('The frame takes the panel’s inner curve on its outer corners', () => {
  const { unmount } = renderPanel({ media: COVER, flat: true });

  // radiusSize 'normal' resolves to the panel's own radius; a flat panel draws no border.
  const flatRadius = getComputedStyle(media()).borderTopLeftRadius;
  expect(flatRadius).not.toBe('0px');
  expect(getComputedStyle(media()).borderTopRightRadius).toBe(flatRadius);
  // Only the corners on the panel's edge: the bottom ones meet the title bar.
  expect(parseFloat(getComputedStyle(media()).borderBottomLeftRadius) || 0).toBe(0);
  unmount();

  // A bordered panel: the media sits inside the 1px border, so its curve is 1px tighter.
  renderPanel({ media: COVER });
  expect(parseFloat(getComputedStyle(media()).borderTopLeftRadius)).toBe(
    parseFloat(flatRadius) - 1
  );
});

test('A square panel draws a square frame', () => {
  renderPanel({ media: COVER, rounded: false });

  expect(getComputedStyle(media()).borderTopLeftRadius).toBe('0px');
});

test('mediaAspectRatio fixes the frame and makes the media cover it', () => {
  renderPanel({ media: COVER, mediaAspectRatio: '16 / 9' });

  const image = media().querySelector('img') as HTMLImageElement;

  expect(media().style.aspectRatio || getComputedStyle(media()).aspectRatio).toBe('16 / 9');
  expect(getComputedStyle(image).height).toBe('100%');
  expect(getComputedStyle(image).objectFit).toBe('cover');
});

test('A node renders as given, and mediaProps reach the frame', () => {
  renderPanel({
    media: <video className='cover-video' />,
    mediaProps: {
      className: 'hero-cover',
      style: { maxHeight: 200 },
      'aria-hidden': true,
      'data-cover': 'video',
    },
  });

  expect(media().querySelector('video.cover-video')).toBeTruthy();
  expect(media().classList.contains('hero-cover')).toBe(true);
  expect(media().classList.contains('reqore-panel-media')).toBe(true);
  expect(media().style.maxHeight).toBe('200px');
  expect(media().getAttribute('aria-hidden')).toBe('true');
  expect(media().getAttribute('data-cover')).toBe('video');
  // None of the media props reach the panel itself.
  expect(panel().hasAttribute('media')).toBe(false);
});

test('The media hides while the panel is collapsed', () => {
  renderPanel({ media: COVER, collapsible: true });

  expect(media()).toBeTruthy();

  fireEvent.click(document.querySelector('.reqore-panel-title'));

  expect(media()).toBeNull();
});

test('A media-only panel is just the frame', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqorePanel media={COVER} padded={false} flat />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(layout()).toEqual(['reqore-panel-media', 'reqore-panel-content']);
  expect(document.querySelector('.reqore-panel-title')).toBeNull();
});
