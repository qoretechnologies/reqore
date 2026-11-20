import { StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import {
  REQORE_BREAKPOINTS,
  TReqoreWindowSizeClass,
} from '../../constants/breakpoints';
import { ReqoreControlGroup, ReqoreP, ReqorePanel, ReqoreTag, useReqoreProperty } from '../../index';
import { StoryMeta } from '../utils';
import { withViewport } from '../utils/viewport';

const meta = {
  title: 'Theme/Window size classes',
} as StoryMeta<any>;

export default meta;
type Story = StoryObj<typeof meta>;

const CLASSES: { id: TReqoreWindowSizeClass; label: string; from: number }[] = [
  { id: 'compact', label: 'Phone · compact', from: 0 },
  { id: 'medium', label: 'Tablet · medium', from: REQORE_BREAKPOINTS.medium },
  { id: 'expanded', label: 'Tablet · expanded', from: REQORE_BREAKPOINTS.expanded },
  { id: 'large', label: 'Desktop · large', from: REQORE_BREAKPOINTS.large },
  { id: 'extraLarge', label: 'Wide · extra-large', from: REQORE_BREAKPOINTS.extraLarge },
];

/** What the provider says about this window: its width, its class and the three flags. */
const WindowSizeClassCard = () => {
  const windowSizeClass = useReqoreProperty('windowSizeClass');
  const isMobile = useReqoreProperty('isMobile');
  const isTablet = useReqoreProperty('isTablet');
  const isMobileOrTablet = useReqoreProperty('isMobileOrTablet');
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);

    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <ReqorePanel
      label={`${width}px wide`}
      className='window-class'
      data-class={windowSizeClass}
      data-mobile={String(isMobile)}
      data-tablet={String(isTablet)}
      data-mobile-or-tablet={String(isMobileOrTablet)}
      padded
      style={{ maxWidth: 560 }}
    >
      <ReqoreControlGroup vertical gapSize='big'>
        <ReqoreControlGroup wrap>
          {CLASSES.map(({ id, label, from }) => (
            <ReqoreTag
              key={id}
              label={`${label} · ${from ? `from ${from}px` : `below ${REQORE_BREAKPOINTS.medium}px`}`}
              intent={id === windowSizeClass ? 'info' : undefined}
              className={id === windowSizeClass ? 'window-class-current' : undefined}
            />
          ))}
        </ReqoreControlGroup>
        <ReqoreControlGroup wrap>
          <ReqoreTag label={`isMobile: ${isMobile}`} intent={isMobile ? 'success' : undefined} />
          <ReqoreTag label={`isTablet: ${isTablet}`} intent={isTablet ? 'success' : undefined} />
          <ReqoreTag
            label={`isMobileOrTablet: ${isMobileOrTablet}`}
            intent={isMobileOrTablet ? 'success' : undefined}
          />
        </ReqoreControlGroup>
        <ReqoreP>
          Material 3's window size classes: a phone below 600px, a tablet to 1199px,
          a desktop from 1200px, wide from 1600px. Each width is in exactly one class.
        </ReqoreP>
      </ReqoreControlGroup>
    </ReqorePanel>
  );
};

/** A story drawn in a window `width` px wide, in Storybook and in its visual capture. */
const atWidth = (width: number, sizeClass: TReqoreWindowSizeClass, isMobile: boolean, isTablet: boolean): Story => ({
  parameters: {
    viewport: {
      options: {
        [`w${width}`]: {
          name: `${width} × 700`,
          styles: { width: `${width}px`, height: '700px' },
          type: 'desktop' as const,
        },
      },
    },
    qlip: { viewport: { width, height: 700 } },
    docs: {
      description: {
        story: `A window ${width}px wide is \`${sizeClass}\`: \`isMobile\` is ${isMobile}, \`isTablet\` is ${isTablet}, \`isMobileOrTablet\` is ${isMobile || isTablet}. The card names its width, highlights its class on Reqore's window size classes (Material 3's) and shows the provider's three flags.`,
      },
    },
  },
  globals: { viewport: { value: `w${width}`, isRotated: false } },
  render: () => <WindowSizeClassCard />,
  play: async ({ canvasElement }) => {
    await withViewport(width, 700, async (narrowed) => {
      expect(narrowed, `the window could be set to ${width}px`).toBe(true);

      await waitFor(() => {
        const card = canvasElement.querySelector('.window-class') as HTMLElement;

        expect(card.dataset.class).toBe(sizeClass);
        expect(card.dataset.mobile).toBe(String(isMobile));
        expect(card.dataset.tablet).toBe(String(isTablet));
        expect(card.dataset.mobileOrTablet).toBe(String(isMobile || isTablet));
      });
    });
  },
});

export const At599APhone: Story = atWidth(599, 'compact', true, false);
export const At600ATablet: Story = atWidth(600, 'medium', false, true);
export const At1199ATablet: Story = atWidth(1199, 'expanded', false, true);
export const At1200ADesktop: Story = atWidth(1200, 'large', false, false);
export const At1599ADesktop: Story = atWidth(1599, 'large', false, false);
export const At1600Wide: Story = atWidth(1600, 'extraLarge', false, false);
