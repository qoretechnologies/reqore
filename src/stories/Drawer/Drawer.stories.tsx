import { StoryFn, StoryObj } from '@storybook/react';
import { expect, fireEvent, userEvent, waitFor } from 'storybook/test';
import { noop } from 'lodash';
import { useLayoutEffect, useState } from 'react';
import { _testsClickButton, _testsWaitForText } from '../../../__tests__/utils';
import { IReqoreDrawerProps, ReqoreDrawer, TPosition } from '../../components/Drawer';
import { IReqoreInputProps } from '../../components/Input';
import { sleep } from '../../helpers/utils';
import {
  ReqoreButton,
  ReqoreCallout,
  ReqoreCollection,
  ReqoreInput,
  ReqoreP,
  ReqorePanel,
  ReqoreTabs,
  ReqoreTabsContent,
  useReqoreProperty,
} from '../../index';
import { StoryMeta } from '../utils';
import { FlatArg, IntentArg, argManager } from '../utils/args';
import { IDragPointerOptions, dragPointer } from '../utils/pointer';
import {
  expectBadgesUnderTitle,
  expectIconBesideTitle,
  expectTitleWhole,
} from '../utils/titleBadges';
import { PHONE_STORY, PHONE_VIEWPORT as PHONE_SCREEN } from '../utils/touchScreen';
import { withViewport } from '../utils/viewport';

import { ThemedSurface } from '../utils/themedSurface';
const { createArg } = argManager<IReqoreDrawerProps>();

const meta = {
  title: 'Dialogs/Drawer',
  component: ReqoreDrawer,
  parameters: {
    chromatic: {
      viewports: [450, 600, 1440],
    },
  },
  argTypes: {
    ...FlatArg,
    ...createArg('floating', {
      type: 'boolean',
      name: 'Floating',
      defaultValue: false,
    }),
    ...createArg('isOpen', {
      type: 'boolean',
      name: 'Open',
      defaultValue: true,
    }),
    ...createArg('resizable', {
      type: 'boolean',
      name: 'Resizable',
      defaultValue: true,
    }),
    ...createArg('hidable', {
      type: 'boolean',
      name: 'Hidable',
      defaultValue: true,
    }),
    ...createArg('position', {
      defaultValue: 'right',
      name: 'Position',
      control: {
        type: 'select',
      },
      options: ['left', 'right', 'top', 'bottom'],
    }),
    ...createArg('size', {
      defaultValue: 'auto',
      name: 'Size',
      type: 'string',
    }),
    ...createArg('minSize', {
      defaultValue: '150px',
      name: 'Minimal Size',
      type: 'string',
    }),
    ...createArg('maxSize', {
      defaultValue: '90vw',
      name: 'Max Size',
      type: 'string',
    }),
    ...createArg('blur', {
      defaultValue: 3,
      name: 'Backdrop blur',
      type: 'number',
    }),
    ...createArg('opacity', {
      defaultValue: 1,
      name: 'Drawer Opacity',
      type: 'number',
    }),
    ...createArg('hasBackdrop', {
      defaultValue: true,
      name: 'Has Backdrop',
      type: 'boolean',
    }),
    ...createArg('swipeToClose', {
      defaultValue: true,
      name: 'Swipe to close',
      type: 'boolean',
      description:
        'While `responsiveLayout` has made the drawer a sheet, dragging its title bar toward its edge and letting go past 18% of its size (or with a flick) closes it; a shorter drag springs back. On by default; nothing outside the sheet layout.',
    }),
    ...IntentArg,
  },
  args: {
    isOpen: true,
    position: 'right',
    resizable: true,
    hidable: true,
    size: 'auto',
    minSize: '150px',
    maxSize: '90vw',
    blur: 3,
    opacity: 1,
    hasBackdrop: true,
  },
} as StoryMeta<typeof ReqoreDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<typeof ReqoreDrawer> = (args) => {
  const confirmAction = useReqoreProperty('confirmAction');

  return (
    <>
      <ReqorePanel label='Just some background text' padded>
        By impossible of in difficulty discovered celebrated ye. Justice joy manners boy met resolve
        produce. Bed head loud next plan rent had easy add him. As earnestly shameless elsewhere
        defective estimable fulfilled of. Esteem my advice it an excuse enable. Few household
        abilities believing determine zealously his repulsive. To open draw dear be by side like.
        Allow miles wound place the leave had. To sitting subject no improve studied limited. Ye
        indulgence unreserved connection alteration appearance my an astonished. Up as seen sent
        make he they of. Her raising and himself pasture believe females. Fancy she stuff after
        aware merit small his. Charmed esteems luckily age out. At ourselves direction believing do
        he departure. Celebrated her had sentiments understood are projection set. Possession ye no
        mr unaffected remarkably at. Wrote house in never fruit up. Pasture imagine my garrets an
        he. However distant she request behaved see nothing. Talking settled at pleased an of me
        brother weather. Breakfast procuring nay end happiness allowance assurance frankness. Met
        simplicity nor difficulty unreserved who. Entreaties mr conviction dissimilar me astonished
        estimating cultivated. On no applauded exquisite my additions. Pronounce add boy estimable
        nay suspected. You sudden nay elinor thirty esteem temper. Quiet leave shy you gay off asked
        large style. Rooms oh fully taken by worse do. Points afraid but may end law lasted. Was out
        laughter raptures returned outweigh. Luckily cheered colonel me do we attacks on highest
        enabled. Tried law yet style child. Bore of true of no be deal. Frequently sufficient in be
        unaffected. The furnished she concluded depending procuring concealed. In to am attended
        desirous raptures declared diverted confined at. Collected instantly remaining up certainly
        to necessary as. Over walk dull into son boy door went new. At or happiness commanded
        daughters as. Is handsome an declared at received in extended vicinity subjects. Into miss
        on he over been late pain an. Only week bore boy what fat case left use. Match round scale
        now sex style far times. Your me past an much. Able an hope of body. Any nay shyness article
        matters own removal nothing his forming. Gay own additions education satisfied the
        perpetual. If he cause manor happy. Without farther she exposed saw man led. Along on happy
        could cease green oh. Her old collecting she considered discovered. So at parties he warrant
        oh staying. Square new horses and put better end. Sincerity collected happiness do is
        contented. Sigh ever way now many. Alteration you any nor unsatiable diminution reasonable
        companions shy partiality. Leaf by left deal mile oh if easy. Added woman first get led joy
        not early jokes. As am hastily invited settled at limited civilly fortune me. Really spring
        in extent an by. Judge but built gay party world. Of so am he remember although required.
        Bachelor unpacked be advanced at. Confined in declared marianne is vicinity. It sportsman
        earnestly ye preserved an on. Moment led family sooner cannot her window pulled any. Or
        raillery if improved landlord to speaking hastened differed he. Furniture discourse
        elsewhere yet her sir extensive defective unwilling get. Why resolution one motionless you
        him thoroughly. Noise is round to in it quick timed doors. Written address greatly get
        attacks inhabit pursuit our but. Lasted hunted enough an up seeing in lively letter. Had
        judgment out opinions property the supplied.
      </ReqorePanel>
      <ReqoreDrawer
        {...args}
        label='This is a test'
        icon='EmphasisCn'
        onClose={noop}
        onHideToggle={(isHidden) => console.log(isHidden)}
        actions={[
          {
            responsive: false,
            group: [
              {
                label: 'Non responsive',
                icon: '24HoursFill',
                customTheme: { main: '#eb0e8c' },
              },
              {
                icon: 'FullscreenExitLine',
                customTheme: { main: '#a40a62' },
              },
            ],
          },
          {
            fixed: true,
            group: [
              { label: 'Stacked Action 1', icon: 'BallPenLine', intent: 'warning' },
              { icon: 'CopperCoinFill', intent: 'danger' },
            ],
          },
          {
            as: ReqoreInput,
            props: {
              placeholder: 'Custom action!',
              icon: 'Search2Line',
              minimal: false,
            } as IReqoreInputProps,
          },
          {
            label: 'More actions',
            actions: [
              { label: 'Sub Test', icon: 'FileDownloadLine' },
              { label: 'Sub Test 2', icon: 'FileDownloadLine', intent: 'success' },
            ],
            intent: 'info',
          },
        ]}
        bottomActions={[
          {
            position: 'left',
            intent: 'success',
            group: [
              { label: 'Test 1', icon: '24HoursFill' },
              { label: 'Test 2', icon: '24HoursFill' },
            ],
          },
          {
            label: 'More actions',
            position: 'right',
            actions: [
              { label: 'Sub Test', icon: 'FileDownloadLine', intent: 'success' },
              { label: 'Sub Test 2', icon: 'FileDownloadLine' },
            ],
          },
        ]}
      >
        <ReqoreTabs
          flat
          intent={args.intent}
          tabs={[
            { label: 'Tab 1 with some long label', id: 'tab1' },
            { label: 'Tab 2 another long label', id: 'tab2' },
          ]}
        >
          <ReqoreTabsContent tabId='tab1'>
            <ReqorePanel
              fill
              title='Tab 1 contents'
              collapsible
              flat
              rounded
              padded
              label='I AM A PANEL'
            >
              I am a message a very long message - Shadowlands has mechanisms put in place for
              allowing players to catch up on Renown, the system of gaining favor and unlocking
              rewards, Campaign chapters, and soulbinds within your Covenant.
            </ReqorePanel>
            <br />
            <ReqoreButton
              onClick={() =>
                confirmAction({
                  content:
                    'This is a simple test to establish the proper balance of your loud speakers',
                })
              }
            >
              Hello I am a super long button that opens a modal on click
            </ReqoreButton>
          </ReqoreTabsContent>
          <ReqoreTabsContent tabId='tab2'>
            Tab 2 here
            <ReqoreCollection items={[{ label: 'Item 1' }, { label: 'Item 2' }]} />
          </ReqoreTabsContent>
        </ReqoreTabs>
      </ReqoreDrawer>
    </>
  );
};

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Drawer in its default configuration.',
      },
    },
  },
  render: Template,
};

export const BasicWithConfirmationOnClose: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Drawer with a confirmation dialog on close.',
      },
    },
  },
  render: Template,
  args: {
    confirmOnClose: {
      content: 'Are you sure you want to close this drawer?',
    },
  },
  play: async () => {
    await _testsWaitForText('This is a test');
    await fireEvent.click(document.querySelector('.reqore-drawer-close-button'));
    await _testsWaitForText('Are you sure you want to close this drawer?');
  },
};

export const Flat: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Drawer in its flat variant.',
      },
    },
  },
  render: Template,

  args: {
    flat: true,
  },
};

export const Floating: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Drawer in its floating variant.',
      },
    },
  },
  render: Template,

  args: {
    floating: true,
  },
};

export const Transparent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Drawer with a transparent background.',
      },
    },
  },
  render: Template,

  args: {
    opacity: 0.5,
  },
};

export const FrostedByAppDefaults: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Drawer as frosted glass decided once for the app: `options.dialogOpacity: 0.72` makes every dialog panel see-through and `options.dialogBlur: 22` blurs what shows through it, over a backdrop softened by `options.backdropBlur: 5`. The drawer passes none of them itself.',
      },
    },
  },
  // The meta's own opacity and blur would win over the app's defaults, and Storybook drops an
  // `undefined` arg rather than letting it override, so they are taken out here.
  render: (args, context) => Template({ ...args, opacity: undefined, blur: undefined }, context),
  args: {
    options: { dialogOpacity: 0.72, dialogBlur: 22, backdropBlur: 5 },
  },
  play: async () => {
    await _testsWaitForText('This is a test');
    const panel = document.querySelector('.reqore-drawer') as HTMLElement;
    // the app's opacity reached the panel; the frost it turns on is asserted in
    // __tests__/drawerDialogSurface.test.tsx (this runner's browser reports no backdrop filter)
    await expect(window.getComputedStyle(panel).backgroundColor).toMatch(/, 0\.72\)$/);
  },
};

export const WithSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Drawer with a specific size applied.',
      },
    },
  },
  render: Template,

  args: {
    size: '500px',
  },
};

export const WithBackgroundBlur: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Drawer with a blurred background.',
      },
    },
  },
  render: Template,

  args: {
    minimal: true,
    size: '500px',
    hasBackdrop: false,
    customTheme: { main: '#3b0541' },
    opacity: 0.7,
    contentEffect: {
      backgroundBlur: 5,
    },
  },
};

/* `responsiveLayout` is qorus-ide's bottom-sheet behaviour moved into the
   library, so the stories pin down what the IDE gets back: WHERE it switches
   (900px, not the provider's 480px), HOW TALL the sheet is (90vh, like every
   IDE drawer today) and what each knob changes. Every story shares one set of
   drawer args; only the viewport and the `responsiveLayout` config differ. */
const SHEET_ARGS = {
  responsiveLayout: true,
  size: '720px',
  position: 'right',
  hidable: true,
  resizable: true,
} as const;

/** The `qlip` + Storybook viewport pair for a phone-width capture. */
const PHONE_VIEWPORT = {
  viewport: { defaultViewport: 'mobile1' },
  qlip: { viewport: { width: 380, height: 700 } },
};

/**
 * `PHONE_VIEWPORT` for a story whose frame after the play shows nothing of the feature — the
 * page with the sheet gone, or a sheet at rest that `ResponsiveSheetMobile` already captures.
 * The play still runs at phone width (the Storybook `viewport` parameter sizes the page before
 * it); only the Qlip capture is skipped, so no empty or duplicate snapshot is produced.
 */
const PHONE_VIEWPORT_UNCAPTURED = {
  ...PHONE_VIEWPORT,
  qlip: { ...PHONE_VIEWPORT.qlip, skip: true },
};

/** 800px: above the provider's mobile breakpoint, below the sheet breakpoint. */
const SMALL_WINDOW_VIEWPORT = {
  viewport: { defaultViewport: 'tablet' },
  qlip: { viewport: { width: 800, height: 700 } },
};

/* The enter spring slides the sheet in from beyond the edge, so the geometry
   is only final once it has settled: query inside `waitFor` and measure
   against the frame's own layout viewport, which is what `position: fixed`
   resolves against. `heightRatio` is the share of the viewport the sheet
   takes (0.9 for the `90vh` default); `edge` is the side it is flush with. */
const expectSheet = async ({
  heightRatio,
  edge,
}: {
  heightRatio: number;
  edge: 'top' | 'bottom';
}) => {
  await _testsWaitForText('This is a test');
  await waitFor(() => {
    const box = document.querySelector('.reqore-drawer-resizable') as HTMLElement;
    expect(box).toBeTruthy();
    expect(box.classList.contains('reqore-drawer-sheet')).toBe(true);
    const { width, height, top, bottom } = box.getBoundingClientRect();
    const { clientWidth, clientHeight } = document.documentElement;
    expect(Math.round(width)).toBe(clientWidth);
    expect(Math.abs(height - clientHeight * heightRatio)).toBeLessThan(2);
    if (edge === 'bottom') {
      expect(Math.abs(bottom - clientHeight)).toBeLessThan(2);
    } else {
      expect(Math.abs(top)).toBeLessThan(2);
    }
    // No hide control and no resize handles on a sheet.
    expect(document.querySelector('.reqore-drawer-hide-button')).toBeNull();
    expect(box.querySelectorAll('[style*="cursor: row-resize"]')).toHaveLength(0);
  });
};

/** The other branch: the caller's 720px right-hand panel, untouched. */
const expectSidePanel = async () => {
  await _testsWaitForText('This is a test');
  await waitFor(() => {
    const box = document.querySelector('.reqore-drawer-resizable') as HTMLElement;
    expect(box).toBeTruthy();
    expect(box.classList.contains('reqore-drawer-sheet')).toBe(false);
    // The caller's own size still drives the box: `re-resizable` writes it inline.
    expect(box.style.width).toBe('720px');
    expect(document.querySelector('.reqore-drawer-hide-button')).toBeTruthy();
  });
};

export const ResponsiveSheetMobile: Story = {
  args: SHEET_ARGS,
  parameters: {
    ...PHONE_VIEWPORT,
    docs: {
      description: {
        story:
          'A `size="720px"` right-hand drawer with `responsiveLayout` on a phone-width screen (captured at 380px): it becomes a bottom sheet the full width of the screen and 90% of its height — the `90vh` default cap, so a strip of page stays visible above it and a tap there closes it. The resize handle and the hide control are gone, and the root carries `.reqore-drawer-sheet`.',
      },
    },
  },
  render: Template,
  play: () => expectSheet({ heightRatio: 0.9, edge: 'bottom' }),
};

export const ResponsiveSheetBelowBreakpoint: Story = {
  args: SHEET_ARGS,
  parameters: {
    ...SMALL_WINDOW_VIEWPORT,
    docs: {
      description: {
        story:
          'The same drawer in an 800px window: wider than the provider’s 600px phone breakpoint, narrower than the 900px sheet breakpoint (`DRAWER_SHEET_BREAKPOINT`, the number qorus-ide uses for all of its drawers). It is still a sheet — a 720px panel would leave 80px of page here, which is no page at all.',
      },
    },
  },
  render: Template,
  play: () => expectSheet({ heightRatio: 0.9, edge: 'bottom' }),
};

export const ResponsiveSheetProviderBreakpoint: Story = {
  args: { ...SHEET_ARGS, responsiveLayout: { below: 'mobile' } },
  parameters: {
    ...SMALL_WINDOW_VIEWPORT,
    docs: {
      description: {
        story:
          'The same 800px window with `responsiveLayout={{ below: "mobile" }}`: the switch now follows the provider’s phone breakpoint (< 600px) instead of the 900px default, so at 800px the caller’s 720px right-hand panel renders unchanged, hide control included. Compare with the story above, which differs only in `below`.',
      },
    },
  },
  render: Template,
  play: expectSidePanel,
};

export const ResponsiveSheetFullHeight: Story = {
  args: { ...SHEET_ARGS, responsiveLayout: { maxSize: '100%' } },
  parameters: {
    ...PHONE_VIEWPORT,
    docs: {
      description: {
        story:
          'A phone-width sheet with `responsiveLayout={{ maxSize: "100%" }}`: the `90vh` cap is lifted and the sheet runs edge to edge, covering the page completely. `maxSize` here is the sheet’s own cap, separate from the drawer’s `maxSize`, which caps the side panel’s width.',
      },
    },
  },
  render: Template,
  play: () => expectSheet({ heightRatio: 1, edge: 'bottom' }),
};

export const ResponsiveSheetFromTop: Story = {
  args: { ...SHEET_ARGS, responsiveLayout: { position: 'top' } },
  parameters: {
    ...PHONE_VIEWPORT,
    docs: {
      description: {
        story:
          'A phone-width sheet with `responsiveLayout={{ position: "top" }}`: the sheet hangs from the top edge instead, still the full width and 90% of the height, leaving the strip of page at the bottom. `position` is the sheet’s edge while the layout is active; the drawer’s own `position` is what it reverts to above the breakpoint.',
      },
    },
  },
  render: Template,
  play: () => expectSheet({ heightRatio: 0.9, edge: 'top' }),
};

export const ResponsiveSheetDesktop: Story = {
  args: SHEET_ARGS,
  parameters: {
    docs: {
      description: {
        story:
          'The same `responsiveLayout` drawer on a desktop screen (1920px): the caller’s 720px right-hand panel renders unchanged, with its hide control, and no `.reqore-drawer-sheet` class — the prop changes nothing above the breakpoint.',
      },
    },
  },
  render: Template,
  play: expectSidePanel,
};

/* Swipe-to-close. The sheet's own title bar is the handle. The stories drive it with real
   pointer events the way a finger does (`dragPointer`) and assert what the drawer did inside
   `waitFor`, because the enter spring and the snap-back both take a moment to settle. A sheet
   that closes leaves a callout on the page behind it, so the story's snapshot shows the outcome
   rather than an empty page. */
const SWIPE_CONTENT = Array.from({ length: 12 }, (_, index) => (
  <ReqoreP key={index}>
    Paragraph {index + 1}. By impossible of in difficulty discovered celebrated ye. Justice joy
    manners boy met resolve produce. Bed head loud next plan rent had easy add him. As earnestly
    shameless elsewhere defective estimable fulfilled of. Esteem my advice it an excuse enable.
  </ReqoreP>
));

const SwipeTemplate: StoryFn<typeof ReqoreDrawer> = (args) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <ReqorePanel label='Just some background text' padded>
        {isOpen ? (
          <ReqoreP>The sheet is open over this page.</ReqoreP>
        ) : (
          <ReqoreCallout intent='success' label='Closed by a swipe' />
        )}
      </ReqorePanel>
      <ReqoreDrawer
        {...args}
        isOpen={isOpen}
        label='Swipe me away'
        icon='DragMoveLine'
        onClose={() => setIsOpen(false)}
        actions={[{ label: 'An action', icon: 'Search2Line' }]}
      >
        {SWIPE_CONTENT}
      </ReqoreDrawer>
    </>
  );
};

const sheetBox = () => document.querySelector('.reqore-drawer-resizable') as HTMLElement;

/** The sheet's own title bar: the handle. */
const sheetHeader = () =>
  document.querySelector(
    '.reqore-drawer-resizable > .reqore-drawer > .reqore-panel-title'
  ) as HTMLElement;

/** The sheet is on screen, flush with `edge`, and not moved by a drag (settled or sprung back). */
const expectSheetAtRest = async (edge: TPosition) => {
  await _testsWaitForText('Swipe me away');
  await waitFor(() => {
    const box = sheetBox();
    expect(box).toBeTruthy();
    expect(box.classList.contains('reqore-drawer-sheet')).toBe(true);
    const rect = box.getBoundingClientRect();
    const { clientWidth, clientHeight } = document.documentElement;
    const gap =
      edge === 'bottom'
        ? clientHeight - rect.bottom
        : edge === 'top'
        ? rect.top
        : edge === 'right'
        ? clientWidth - rect.right
        : rect.left;
    expect(Math.abs(gap)).toBeLessThan(2);
    expect(box.style.transform || 'none').toBe('none');
  });
};

/**
 * Drags the sheet's title bar by `share` of the sheet's size along its axis: toward its edge when
 * positive, away from it when negative.
 */
const swipeSheet = async (edge: TPosition, share: number, options?: IDragPointerOptions) => {
  const header = sheetHeader();
  const grab = header.getBoundingClientRect();
  const box = sheetBox().getBoundingClientRect();
  const distance = (edge === 'top' || edge === 'bottom' ? box.height : box.width) * share;
  const by =
    edge === 'bottom'
      ? { dx: 0, dy: distance }
      : edge === 'top'
      ? { dx: 0, dy: -distance }
      : edge === 'right'
      ? { dx: distance, dy: 0 }
      : { dx: -distance, dy: 0 };

  await dragPointer(
    header,
    { x: grab.left + grab.width / 2, y: grab.top + grab.height / 2 },
    by,
    options
  );
};

const expectSheetClosed = async () => {
  await _testsWaitForText('Closed by a swipe');
  await waitFor(() => expect(document.querySelector('.reqore-drawer-sheet')).toBeNull());
};

export const SheetSwipeToClose: Story = {
  args: SHEET_ARGS,
  parameters: {
    ...PHONE_VIEWPORT_UNCAPTURED,
    docs: {
      description: {
        story:
          'A phone-width sheet pushed away: its title bar is dragged down by 40% of its height and let go, the sheet closes, and the page behind it says so with a callout. Swipe-to-close is on for every `responsiveLayout` sheet unless `swipeToClose={false}`.',
      },
    },
  },
  render: SwipeTemplate,
  play: async () => {
    await expectSheetAtRest('bottom');
    await expect(sheetBox().classList.contains('reqore-drawer-swipeable')).toBe(true);
    await swipeSheet('bottom', 0.4);
    await expectSheetClosed();
  },
};

export const SheetSwipeSpringsBack: Story = {
  args: SHEET_ARGS,
  parameters: {
    ...PHONE_VIEWPORT_UNCAPTURED,
    docs: {
      description: {
        story:
          'The same sheet dragged down by only 6% of its height, held still and let go: too short to count and not a flick, so it springs back to its edge and stays open.',
      },
    },
  },
  render: SwipeTemplate,
  play: async () => {
    await expectSheetAtRest('bottom');
    await swipeSheet('bottom', 0.06, { settle: 80 });
    await expectSheetAtRest('bottom');
    await expect(document.querySelector('.reqore-callout')).toBeNull();
  },
};

export const SheetSwipeAsksFirst: Story = {
  args: { ...SHEET_ARGS, confirmOnClose: { content: 'Close this sheet?' } },
  parameters: {
    ...PHONE_VIEWPORT_UNCAPTURED,
    docs: {
      description: {
        story:
          'A sheet with `confirmOnClose` pushed away: the swipe goes through the same close path as the close button, so the confirmation asks first while the sheet springs back under it; confirming then closes the sheet.',
      },
    },
  },
  render: SwipeTemplate,
  play: async () => {
    await expectSheetAtRest('bottom');
    await swipeSheet('bottom', 0.4);
    await _testsWaitForText('Close this sheet?');
    await expectSheetAtRest('bottom');
    await _testsClickButton({ label: 'Confirm' });
    await expectSheetClosed();
  },
};

export const SheetSwipeFromTop: Story = {
  args: { ...SHEET_ARGS, responsiveLayout: { position: 'top' } },
  parameters: {
    ...PHONE_VIEWPORT_UNCAPTURED,
    docs: {
      description: {
        story:
          'A sheet hanging from the top edge (`responsiveLayout={{ position: "top" }}`) is pushed away upward: dragged up by 40% of its height and let go, it closes. Every sheet swipes toward its own edge.',
      },
    },
  },
  render: SwipeTemplate,
  play: async () => {
    await expectSheetAtRest('top');
    await swipeSheet('top', 0.4);
    await expectSheetClosed();
  },
};

export const SheetSwipeSideSheet: Story = {
  args: { ...SHEET_ARGS, responsiveLayout: { position: 'right', maxSize: '85vw' } },
  parameters: {
    ...PHONE_VIEWPORT_UNCAPTURED,
    docs: {
      description: {
        story:
          'A side sheet (`responsiveLayout={{ position: "right", maxSize: "85vw" }}`) is pushed away to the right: dragged by 40% of its width and let go, it closes; a drag that moves mostly up or down is left to the content.',
      },
    },
  },
  render: SwipeTemplate,
  play: async () => {
    await expectSheetAtRest('right');
    await swipeSheet('right', 0.4);
    await expectSheetClosed();
  },
};

export const SheetSwipeOff: Story = {
  args: { ...SHEET_ARGS, swipeToClose: false },
  parameters: {
    ...PHONE_VIEWPORT_UNCAPTURED,
    docs: {
      description: {
        story:
          'A sheet with `swipeToClose={false}`: its title bar is dragged down by 40% of its height and let go, and nothing happens — the sheet stays where it is, without the `.reqore-drawer-swipeable` class, and only the close button closes it.',
      },
    },
  },
  render: SwipeTemplate,
  play: async () => {
    await expectSheetAtRest('bottom');
    await expect(sheetBox().classList.contains('reqore-drawer-swipeable')).toBe(false);
    await swipeSheet('bottom', 0.4);
    await sleep(500);
    await expectSheetAtRest('bottom');
  },
};

export const SheetContentScrollsAsBefore: Story = {
  args: SHEET_ARGS,
  parameters: {
    ...PHONE_VIEWPORT_UNCAPTURED,
    docs: {
      description: {
        story:
          'The same swipeable sheet with twelve paragraphs in it: a drag down the content by 40% of the sheet’s height is not a swipe — the content is a scroller and keeps its gesture — so the sheet stays open and in place. Only the title bar is the handle.',
      },
    },
  },
  render: SwipeTemplate,
  play: async () => {
    await expectSheetAtRest('bottom');
    const content = sheetBox().querySelector(
      ':scope > .reqore-drawer > .reqore-panel-content'
    ) as HTMLElement;
    await expect(content).toBeTruthy();
    await expect(content.scrollHeight).toBeGreaterThan(content.clientHeight);
    const grab = content.getBoundingClientRect();
    await dragPointer(
      content,
      { x: grab.left + grab.width / 2, y: grab.top + 40 },
      { dx: 0, dy: sheetBox().getBoundingClientRect().height * 0.4 }
    );
    await sleep(500);
    await expectSheetAtRest('bottom');
  },
};

export const SheetSwipeInProgress: Story = {
  args: SHEET_ARGS,
  parameters: {
    ...PHONE_VIEWPORT,
    docs: {
      description: {
        story:
          'A phone-width sheet caught mid-swipe: its title bar has been dragged down by 30% of its height and is still held, so the sheet sits that far below its edge with the page showing above it, the root carries `.reqore-drawer-dragging`, and nothing is animating. The one swipe story Qlip captures — the others end on a closed sheet or a sheet at rest.',
      },
    },
  },
  render: SwipeTemplate,
  play: async () => {
    await expectSheetAtRest('bottom');
    const height = sheetBox().getBoundingClientRect().height;
    await swipeSheet('bottom', 0.3, { release: false });
    await waitFor(() => {
      const box = sheetBox();
      expect(box.classList.contains('reqore-drawer-dragging')).toBe(true);
      // The browser serialises the translate with its own precision; the rect below pins it.
      expect(box.style.transform).toMatch(/^translate3d\(0px, \d+(\.\d+)?px, 0(px)?\)$/);
      const { clientHeight } = document.documentElement;
      expect(Math.abs(box.getBoundingClientRect().bottom - clientHeight - height * 0.3)).toBeLessThan(2);
    });
  },
};

/** The drawer's box at each of the first frames after it mounts: what `FloatingSheetOnAPhone` checks. */
interface ISheetFrame {
  width: number;
  left: number;
  right: number;
  sheet: boolean;
}

const SHEET_FRAMES_SAMPLED = 30;
const sheetFrames: ISheetFrame[] = [];

/**
 * Measures the drawer's box as it is first laid out - in a layout effect of the commit that mounts
 * it, before anything is painted - and at each of the next frames, while it slides in.
 */
const SheetFrameProbe = () => {
  useLayoutEffect(() => {
    let frame = 0;
    let request = 0;
    const sample = () => {
      const box = document.querySelector('.reqore-drawer-resizable');

      if (box) {
        const rect = box.getBoundingClientRect();
        sheetFrames.push({
          width: rect.width,
          left: rect.left,
          right: document.documentElement.clientWidth - rect.right,
          sheet: box.classList.contains('reqore-drawer-sheet'),
        });
      }

      frame += 1;

      if (frame < SHEET_FRAMES_SAMPLED) {
        request = requestAnimationFrame(sample);
      }
    };

    sheetFrames.length = 0;
    sample();

    return () => cancelAnimationFrame(request);
  }, []);

  return null;
};

export const FloatingSheetOnAPhone: Story = {
  tags: ['touch'],
  globals: PHONE_STORY.globals,
  args: { ...SHEET_ARGS, floating: true },
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          'A `floating` right-hand drawer with `responsiveLayout`, opened on a phone (390 px): it is a bottom sheet exactly the width of the screen from its first frame - not the floating side panel for a frame, and not a sheet 10 px short of the right edge, the offset a floating panel keeps from it.',
      },
    },
  },
  render: (args) => (
    <>
      <Template {...args} />
      <SheetFrameProbe />
    </>
  ),
  play: async () => {
    await waitFor(() => expect(sheetFrames).toHaveLength(SHEET_FRAMES_SAMPLED));

    const { clientWidth } = document.documentElement;

    sheetFrames.forEach((frame) => {
      expect(frame.sheet).toBe(true);
      expect(Math.round(frame.width)).toBe(clientWidth);
      expect(Math.round(frame.left)).toBe(0);
      expect(Math.round(frame.right)).toBe(0);
    });
    await expectSheet({ heightRatio: 0.9, edge: 'bottom' });
  },
};

export const ThemedPanelSurface: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders an open drawer on the themed surface: with `theme.panel` set it is a panel like any other — the panel surface, title bar included, and the hairline.',
      },
    },
  },
  render: () => (
    <ThemedSurface>
      <ReqoreDrawer isOpen position='right' size='420px' label='A drawer on the themed surface'>
        <ReqoreP>Drawers are panels, so they follow theme.panel.</ReqoreP>
      </ReqoreDrawer>
    </ThemedSurface>
  ),
};

export const TitleBadgesBelowOnAPhone: Story = {
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          'Renders a template drawer on a phone (390 px): an icon, the title "Order Sync Template", three badges (its status, version and kind), a description, a copy button and the close button. The badges do not fit beside the title, so they move to a line under it, on its left edge; the kind icon stays beside the title, and the title is whole: every word on screen, none cut.',
      },
    },
  },
  render: () => (
    <ReqoreDrawer
      isOpen
      responsiveLayout
      size='600px'
      position='right'
      label='Order Sync Template'
      description='by Jane Novak · 12 Nov 2026'
      icon='FileListLine'
      onClose={noop}
      badge={[
        { label: 'In review', icon: 'TimeLine', appearance: 'text' },
        { label: 'v3', appearance: 'soft' },
        { label: 'workflow', appearance: 'soft' },
      ]}
      actions={[{ icon: 'FileCopyLine', tooltip: 'Copy ID', 'aria-label': 'Copy ID', flat: true }]}
    >
      <ReqoreP>The template's states and comments.</ReqoreP>
    </ReqoreDrawer>
  ),
  play: async () => {
    await withViewport(PHONE_SCREEN.width, PHONE_SCREEN.height, async () => {
      await waitFor(() => expect(document.querySelector('.reqore-drawer')).toBeTruthy());

      const drawer = document.querySelector('.reqore-drawer') as HTMLElement;

      await expectBadgesUnderTitle(drawer);
      await expectTitleWhole(drawer);
      await expectIconBesideTitle(drawer);
    });
  },
};

export const SplitButtonKeepsItsWordsOnAPhone: Story = {
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          'Renders a review drawer on a phone (390 px) whose bottom bar holds a split button: "Reject" with its icon (`responsive: false`, so its words stay at any width) and a caret opening "Reject and comment", beside "Approve". Both halves of the split button are drawn, and "Reject" says its word; "Approve", which does not ask to keep its words, folds to its icon on the phone.',
      },
    },
  },
  render: () => (
    <ReqoreDrawer
      isOpen
      responsiveLayout
      size='600px'
      position='right'
      label='Snapshot review'
      onClose={noop}
      bottomActions={[
        {
          responsive: false,
          position: 'left',
          group: [
            { label: 'Reject', icon: 'CloseLine', responsive: false, className: 'story-reject' },
            {
              icon: 'ArrowDownSLine',
              className: 'story-reject-more',
              'aria-label': 'More ways to reject',
              actions: [{ label: 'Reject and comment' }],
            },
          ],
        },
        { label: 'Approve', icon: 'CheckLine', position: 'right', className: 'story-approve' },
      ]}
    >
      <ReqoreP>Two pixels moved in the header.</ReqoreP>
    </ReqoreDrawer>
  ),
  play: async () => {
    await withViewport(PHONE_SCREEN.width, PHONE_SCREEN.height, async (narrowed) => {
      const reject = await waitFor(() => {
        const element = document.querySelector<HTMLElement>('.story-reject');
        expect(element).toBeTruthy();
        return element!;
      });

      // Both halves of the split button, and the words of the half that asks to keep them.
      await expect(document.querySelector('.story-reject-more')).toBeTruthy();
      await expect(reject.textContent).toContain('Reject');
      if (narrowed) {
        // A label that does not ask to stay folds to its icon on the phone, as before.
        await waitFor(() =>
          expect(document.querySelector('.story-approve')?.textContent ?? '').not.toContain(
            'Approve'
          )
        );
      }
    });
  },
};

export const CalmTitleSizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders a drawer under the calm apps' heading sizes (`typeScale: { heading: { 3: 16 }, headingWeight: 600, dialogHeading: 20 }`): the drawer's own title at 20px, a card inside it at 16px, both at weight 600. A dialog's title is a step above a card's (board q54).",
      },
    },
  },
  args: {
    otherThemeOptions: { typeScale: { heading: { 3: 16 }, headingWeight: 600, dialogHeading: 20 } },
  },
  render: () => (
    <ReqoreDrawer isOpen label='Order sync' position='right' size='600px' onClose={noop} hasBackdrop={false}>
      <ReqorePanel label='Retry policy' className='story-card' flat={false} padded>
        <ReqoreP>Three tries, a minute apart.</ReqoreP>
      </ReqorePanel>
    </ReqoreDrawer>
  ),
  play: async () => {
    const title = await waitFor(() => {
      const heading = Array.from(document.querySelectorAll<HTMLElement>('.reqore-drawer .reqore-heading')).find(
        (element) => element.textContent?.includes('Order sync')
      );
      expect(heading).toBeTruthy();
      return heading!;
    });
    const card = document.querySelector<HTMLElement>('.story-card .reqore-heading')!;

    await expect(getComputedStyle(title).fontSize).toBe('20px');
    await expect(getComputedStyle(card).fontSize).toBe('16px');
    await expect(getComputedStyle(title).fontWeight).toBe('600');
    await expect(getComputedStyle(card).fontWeight).toBe('600');
  },
};

/** A page whose button opens a drawer with no backdrop, as a details panel beside a list. */
const DetailsBesideThePage = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ReqoreButton className='story-open-details' onClick={() => setOpen(true)}>
        Open details
      </ReqoreButton>
      {open ? (
        <ReqoreDrawer
          isOpen
          hasBackdrop={false}
          size='400px'
          label='Order details'
          onClose={() => setOpen(false)}
        >
          <ReqoreP>Order 1042, shipped yesterday.</ReqoreP>
          <ReqoreButton>Track it</ReqoreButton>
        </ReqoreDrawer>
      ) : null}
    </>
  );
};

export const KeyboardOpensAndClosesADrawer: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a page whose "Open details" button opens a drawer with no backdrop. From the keyboard: Enter opens it and focus moves into it (the drawer as a whole, not its first control), Escape closes it and focus returns to "Open details", drawn with the keyboard\'s ring. Captured after the close.',
      },
    },
  },
  render: () => <DetailsBesideThePage />,
  play: async () => {
    const opener = await waitFor(() =>
      document.querySelector<HTMLButtonElement>('.story-open-details')!
    );

    opener.focus();
    await userEvent.keyboard('{Enter}');
    const wrapper = await waitFor(() => {
      const element = document.querySelector<HTMLElement>('.reqore-drawer-wrapper');
      expect(element).not.toBeNull();
      expect(document.activeElement).toBe(element);
      return element!;
    });
    expect(wrapper.getAttribute('role')).toBe('dialog');

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(document.querySelector('.reqore-drawer-wrapper')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(opener));
  },
};

/**
 * The admin portal's A/B test sheet on a phone: its icon, its long name and its status word with a dot, on the calm
 * heading sizes. Only the status word differs between the two stories below.
 */
const ExperimentSheet = ({ status }: { status: string }) => {
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ReqoreDrawer
      isOpen
      position='bottom'
      size='88vh'
      flat
      label={loaded ? 'Hero: Qonsole input vs problem wizard' : 'A/B test'}
      icon='FlaskLine'
      badge={loaded ? { label: status, icon: 'CheckboxBlankCircleFill', appearance: 'text' } : undefined}
      onClose={noop}
    >
      <ReqoreP>Visitors and conversion per version.</ReqoreP>
    </ReqoreDrawer>
  );
};

/** The sheet's title: its size, and how many lines it takes. */
const sheetTitle = () =>
  waitFor(() => {
    const heading = document.querySelector<HTMLElement>('.reqore-drawer .reqore-heading');

    expect(heading?.textContent).toContain('Hero: Qonsole input');

    // the lines its words are on: the tops of its text's boxes
    const range = document.createRange();

    range.selectNodeContents(heading!);

    const tops = new Set(
      Array.from(range.getClientRects())
        .filter((rect) => rect.width > 0)
        .map((rect) => Math.round(rect.top))
    );

    return { size: getComputedStyle(heading!).fontSize, lines: tops.size };
  });

/**
 * The title at its natural size, wrapped to two lines, its status word under it. A word as long as "Running · phase
 * 2" beside the title took the room the title was measured for: the title shrank to 16px to fit beside it, and then
 * took its line whole with the word under it after all, one line at 16px where every other test showed two at 20
 * (the admin portal's ExperimentDrawer › Removed Version at 390).
 */
const expectSheetTitleAtItsSize = async () => {
  await withViewport(PHONE_SCREEN.width, PHONE_SCREEN.height, async () => {
    const drawer = await waitFor(() => {
      const element = document.querySelector<HTMLElement>('.reqore-drawer');

      expect(element).toBeTruthy();

      return element!;
    });

    await expectBadgesUnderTitle(drawer);
    await expectTitleWhole(drawer);
    await waitFor(async () => expect(await sheetTitle()).toEqual({ size: '20px', lines: 2 }));
  });
};

export const TheSameTitleAtTheSameSizeBesideAShortWord: Story = {
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          'Renders an A/B test sheet on a phone (390 px) under the calm heading sizes: the title "Hero: Qonsole input vs problem wizard" with its status word "Ended" under it. The title keeps its 20px and wraps to two lines.',
      },
    },
  },
  args: {
    otherThemeOptions: { typeScale: { heading: { 3: 16 }, headingWeight: 600, dialogHeading: 20 } },
  },
  render: () => <ExperimentSheet status='Ended' />,
  play: expectSheetTitleAtItsSize,
};

export const TheSameTitleAtTheSameSizeBesideALongWord: Story = {
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          'Renders the same A/B test sheet with a longer status word, "Running · phase 2". The word goes under the title before the title gives anything, so the title is drawn as beside "Ended": 20px, two lines.',
      },
    },
  },
  args: {
    otherThemeOptions: { typeScale: { heading: { 3: 16 }, headingWeight: 600, dialogHeading: 20 } },
  },
  render: () => <ExperimentSheet status='Running · phase 2' />,
  play: expectSheetTitleAtItsSize,
};
