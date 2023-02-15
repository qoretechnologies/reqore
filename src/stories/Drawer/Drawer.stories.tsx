import { Meta, Story } from '@storybook/react/types-6-0';
import { noop } from 'lodash';
import { IReqoreDrawerProps, ReqoreDrawer } from '../../components/Drawer';
import { IReqoreInputProps } from '../../components/Input';
import {
  ReqoreButton,
  ReqoreInput,
  ReqorePanel,
  ReqoreTabs,
  ReqoreTabsContent,
  useReqoreProperty,
} from '../../index';
import { FlatArg, IntentArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreDrawerProps>();

export default {
  title: 'Components/Drawer',
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
} as Meta;

const Template: Story<IReqoreDrawerProps> = (args: IReqoreDrawerProps) => {
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
              { value: 'Sub Test', icon: 'FileDownloadLine' },
              { value: 'Sub Test 2', icon: 'FileDownloadLine', intent: 'success' },
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
              { value: 'Sub Test', icon: 'FileDownloadLine', intent: 'success' },
              { value: 'Sub Test 2', icon: 'FileDownloadLine' },
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
                  description:
                    'This is a simple test to establish the proper balance of your loud speakers',
                })
              }
            >
              Hello I am a super long button that opens a modal on click
            </ReqoreButton>
          </ReqoreTabsContent>
          <ReqoreTabsContent tabId='tab2'>Tab 2 here</ReqoreTabsContent>
        </ReqoreTabs>
      </ReqoreDrawer>
    </>
  );
};

export const Basic = Template.bind({});
export const Flat = Template.bind({});
Flat.args = {
  flat: true,
};
export const Floating = Template.bind({});
Floating.args = {
  floating: true,
};
export const Transparent = Template.bind({});
Transparent.args = {
  opacity: 0.5,
};
export const WithSize = Template.bind({});
WithSize.args = {
  size: '500px',
};
