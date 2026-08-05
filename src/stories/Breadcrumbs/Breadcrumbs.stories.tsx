import { StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';
import { ReqoreBreadcrumbs, ReqoreButton, ReqoreControlGroup } from '../../index';
import breadcrumbs, { breadcrumbsTabs, specialbreadcrumbs } from '../../mock/breadcrumbs';
import { StoryMeta } from '../utils';
import { SizeArg } from '../utils/args';

const meta = {
  title: 'Navigation/Breadcrumbs',
  component: ReqoreBreadcrumbs,
  argTypes: {
    withTabs: {
      name: 'With tabs',
      description: 'Whether tabs should be shown alongside the breadcrumbs',
      control: 'boolean',
    },
    ...SizeArg,
  },
  args: { items: breadcrumbs },
} as StoryMeta<typeof ReqoreBreadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Breadcrumbs in its default configuration.',
      },
    },
  },};
export const WithTabs: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Breadcrumbs with tabs rendered inside.',
      },
    },
  }, args: { items: [...breadcrumbs, breadcrumbsTabs] } };
export const Flat: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Breadcrumbs in its flat variant.',
      },
    },
  }, args: { flat: true } };
export const Special: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Breadcrumbs in a special configuration.',
      },
    },
  }, args: { items: specialbreadcrumbs } };
export const CustomTheme: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Breadcrumbs with a custom theme override applied.',
      },
    },
  },
  args: {
    items: breadcrumbs,
    customTheme: {
      main: '#ff69b4',
    },
  },
};

// A right-hand action rail next to a long trail in a width-constrained bar. The
// responsive collapse RESERVES the rail's width (so items never overrun it), the
// ancestors fold into a "…" group, and the last (current-page) crumb stays
// visible and truncates with an ellipsis rather than clipping into the rail.
export const WithReservedRightElement: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A right element (action rail) has its width reserved by the responsive collapse, so the trail never overruns it; the leaf crumb stays visible and truncates instead of clipping.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '640px', border: '1px dashed #555', padding: '4px' }}>
      <ReqoreBreadcrumbs
        {...args}
        items={[
          { label: 'Interfaces', icon: 'Home3Line' },
          { label: 'Jobs', icon: 'CalendarLine', badge: [128] },
          {
            label: 'A New Scheduled Job With A Rather Long Name',
            icon: 'CalendarLine',
            readOnly: true,
            badge: [{ label: 'Saved', icon: 'CheckLine', intent: 'success' }],
          },
        ]}
        rightElement={
          <ReqoreControlGroup>
            <ReqoreButton icon='EditLine' minimal flat />
            <ReqoreButton icon='FileCopyLine' minimal flat />
            <ReqoreButton icon='DeleteBinLine' intent='danger' minimal flat />
            <ReqoreButton icon='CheckLine' intent='success'>
              Submit
            </ReqoreButton>
          </ReqoreControlGroup>
        }
      />
    </div>
  ),
};

// Regression guard for the no-overlap invariant: in a width-constrained bar the
// trail and the right-hand element (an action rail) must never overlap, at any
// width. The trail collapses ancestors into the "…" menu and truncates the
// current page; the right element keeps its full width. The play asserts, via
// `getBoundingClientRect`, that the trail's right edge never crosses into the
// right element — the core guarantee of the flex layout.
export const NoOverlapWithRightElement: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The trail (breadcrumbs) and a right-hand action rail share a narrow bar. They must never overlap: the trail collapses + truncates, the right element stays fully visible. The play asserts trail.right <= rightElement.left.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '480px', border: '1px dashed #555', padding: '4px' }}>
      <ReqoreBreadcrumbs
        {...args}
        items={[
          { label: 'Interfaces', icon: 'Home3Line' },
          { label: 'Jobs', icon: 'CalendarLine', badge: [128] },
          {
            label: 'A New Scheduled Job With A Rather Long Name',
            icon: 'CalendarLine',
            readOnly: true,
            badge: [{ label: 'Saved', icon: 'CheckLine', intent: 'success' }],
          },
        ]}
        rightElement={
          <ReqoreControlGroup>
            <ReqoreButton icon='EditLine' minimal flat />
            <ReqoreButton icon='FileCopyLine' minimal flat />
            <ReqoreButton icon='DeleteBinLine' intent='danger' minimal flat />
            <ReqoreButton icon='CheckLine' intent='success'>
              Submit
            </ReqoreButton>
          </ReqoreControlGroup>
        }
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Wait until the overflow measurement has run — the "…" menu appears once
    // the ancestors collapse, which only happens after a real layout pass.
    await waitFor(() =>
      expect(canvasElement.querySelector('.reqore-dropdown-control')).toBeInTheDocument()
    );

    const trail = canvasElement.querySelector('.reqore-breadcrumbs-trail') as HTMLElement;
    const right = canvasElement.querySelector('.reqore-breadcrumbs-right') as HTMLElement;
    await expect(trail).toBeInTheDocument();
    await expect(right).toBeInTheDocument();

    // The invariant: the trail never crosses into the right element (1px slack
    // for sub-pixel rounding). This is impossible to violate with the flex
    // `flex-shrink: 0` right region — the guard makes regressions loud.
    const trailRect = trail.getBoundingClientRect();
    const rightRect = right.getBoundingClientRect();
    await expect(trailRect.right).toBeLessThanOrEqual(rightRect.left + 1);

    // The current page stays reachable — either as an inline crumb (wider bars)
    // or, once the bar is this tight, as the single dropdown LABELLED with it.
    // Never folded away to nothing.
    await expect(
      canvasElement.querySelector('.reqore-breadcrumbs-overflow-current, .reqore-breadcrumbs-item')
    ).toBeInTheDocument();
  },
};

// Regression guard: re-rendering with a NEW `items` array identity (as an
// unstable upstream `useMemo` would) must NOT accumulate crumbs. The bug was a
// key derived from `items.indexOf(item)`, which returned -1 for the stale item
// objects OverflowList maps over during a re-render — collapsing every crumb
// onto one key so React appended a fresh (duplicate) crumb on every render. The
// play re-renders repeatedly and asserts the crumb count stays put.
const ReRenderStress = () => {
  const [n, setN] = useState(0);
  // Deliberately a new array + new objects every render.
  const items = [
    { icon: 'Home3Line' as const },
    { label: 'Current Page', icon: 'CalendarLine' as const, badge: [9] },
  ];
  return (
    <div>
      <ReqoreButton data-testid='rerender' onClick={() => setN(n + 1)}>
        re-render ({n})
      </ReqoreButton>
      <div style={{ width: '700px', marginTop: '10px' }}>
        <ReqoreBreadcrumbs items={items} />
      </div>
    </div>
  );
};

export const StableAcrossReRenders: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Re-rendering with a fresh items array must not accumulate crumbs (a keying regression once appended a new crumb on every render). The play re-renders 8 times and asserts the crumb count is unchanged.',
      },
    },
  },
  render: () => <ReRenderStress />,
  play: async ({ canvasElement }) => {
    const btn = canvasElement.querySelector('[data-testid="rerender"]') as HTMLElement;
    for (let i = 0; i < 8; i++) {
      btn.click();
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    }
    // Two crumbs in, two crumbs out — never a growing pile.
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.reqore-breadcrumbs-item').length).toBe(2)
    );
  },
};

// A per-item-themed trail (each crumb its OWN customTheme + uppercase effect +
// icon + badge; NO top-level breadcrumbs customTheme — the shape a host like a
// page-header builds) squeezed until it fully collapses. The single current-page
// dropdown must READ AS the leaf crumb: adopt its customTheme, effect, icon and
// badge — not fall back to a plain, unthemed, normal-cased button.
export const CollapsedAdoptsLeafTheme: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'When a per-item-themed trail collapses fully, the single current-page dropdown adopts the leaf crumb’s own customTheme, effect (e.g. uppercase), icon and badge instead of rendering as a plain button.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '320px', border: '1px dashed #555', padding: '4px' }}>
      <ReqoreBreadcrumbs
        {...args}
        items={[
          { icon: 'Home4Fill', customTheme: { main: '#1b101b' }, raised: true, minimal: true, flat: true },
          {
            label: 'Jobs',
            icon: 'CalendarLine',
            customTheme: { main: '#100b10' },
            effect: { uppercase: true, spaced: 1, textSize: 'small' },
            raised: true,
            minimal: true,
            flat: true,
          },
          {
            label: 'Bbm Data Provider Create Processor Test',
            icon: 'CalendarLine',
            badge: ['#50'],
            customTheme: { main: '#100b10' },
            effect: { uppercase: true, spaced: 1, textSize: 'small' },
            active: true,
          },
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('.reqore-breadcrumbs-overflow-current')).toBeInTheDocument()
    );
    const btn = canvasElement.querySelector('.reqore-breadcrumbs-overflow-current');
    // The leaf's label, badge and an icon all flow through to the collapsed button.
    await expect(btn?.textContent).toContain('Bbm');
    await expect(btn?.textContent).toContain('#50');
    await expect(btn?.querySelector('svg')).toBeInTheDocument();
  },
};
