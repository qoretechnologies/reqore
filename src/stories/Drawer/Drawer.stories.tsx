import { StoryFn, StoryObj } from '@storybook/react';
import { expect, fireEvent, waitFor } from 'storybook/test';
import { noop } from 'lodash';
import { _testsWaitForText } from '../../../__tests__/utils';
import { IReqoreDrawerProps, ReqoreDrawer } from '../../components/Drawer';
import { IReqoreInputProps } from '../../components/Input';
import {
  ReqoreButton,
  ReqoreCollection,
  ReqoreInput,
  ReqorePanel,
  ReqoreTabs,
  ReqoreTabsContent,
  useReqoreProperty,
} from '../../index';
import { StoryMeta } from '../utils';
import { FlatArg, IntentArg, argManager } from '../utils/args';

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
          'The same drawer in an 800px window: wider than the provider’s 480px mobile breakpoint, narrower than the 900px sheet breakpoint (`DRAWER_SHEET_BREAKPOINT`, the number qorus-ide uses for all of its drawers). It is still a sheet — a 720px panel would leave 80px of page here, which is no page at all.',
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
          'The same 800px window with `responsiveLayout={{ below: "mobile" }}`: the switch now follows the provider’s phone breakpoint (≤ 480px) instead of the 900px default, so at 800px the caller’s 720px right-hand panel renders unchanged, hide control included. Compare with the story above, which differs only in `below`.',
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
