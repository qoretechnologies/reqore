import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { useMount } from 'react-use';
import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { DEFERRED_CLOSE_DELAY, IReqorePopoverProps } from '../../components/Popover';
import { sleep } from '../../helpers/utils';
import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreMenu,
  ReqoreMenuItem,
  ReqoreMessage,
  ReqoreModal,
  ReqorePanel,
  ReqorePopover,
  ReqoreSpacer,
  ReqoreTextarea,
} from '../../index';
import { IReqoreTooltip } from '../../types/global';
import { StoryMeta } from '../utils';
import { FlatArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqorePopoverProps>();

const meta = {
  title: 'Other/Popover',
  component: ReqorePopover,
  args: {
    content: 'This is a popover',
    flat: true,
  },
  argTypes: {
    ...createArg('transparent', {
      defaultValue: false,
      name: 'Transparent',
      description: 'Makes the popover transparent',
      type: 'boolean',
    }),
    ...createArg('blur', {
      defaultValue: false,
      name: 'Blur',
      description: 'Makes the popover blurred',
      type: 'boolean',
    }),
    ...createArg('maxHeight', {
      defaultValue: undefined,
      name: 'Max Height',
      description: 'Sets the max height of the popover',
      type: 'string',
    }),
    ...createArg('maxWidth', {
      defaultValue: undefined,
      name: 'Max Width',
      description: 'Sets the max width of the popover',
      type: 'string',
    }),
    ...createArg('content', {
      defaultValue: 'This is a popover',
      name: 'Content',
      description: 'The content of the popover',
      type: 'string',
    }),
    ...FlatArg,
  },
} as StoryMeta<typeof ReqorePopover>;

type Story = StoryObj<typeof meta>;
export default meta;

const HoverButton = (args: any) => {
  return (
    <ReqorePopover component={ReqoreButton} isReqoreComponent {...args} fixed>
      Hover popover
    </ReqorePopover>
  );
};

const HoverKeepOpenButton = (args: any) => {
  return (
    <ReqorePopover
      component={ReqoreButton}
      isReqoreComponent
      {...args}
      fixed
      keepOpenOnHover
      closeOnInsideClick={false}
    >
      Hover for actions
    </ReqorePopover>
  );
};

const ClickButton = (args: any) => {
  return (
    <ReqoreButton
      tooltip={{
        handler: 'click',
        closeOnOutsideClick: true,
        noArrow: true,
        useTargetWidth: true,
        ...args,
      }}
    >
      Click popover
    </ReqoreButton>
  );
};

const DelayButton = (args: any) => {
  return (
    <ReqoreButton
      tooltip={{
        delay: 500,
        ...args,
      }}
    >
      Tooltip with delay of 500ms
    </ReqoreButton>
  );
};

const HoverStayButton = (args: any) => {
  return (
    <ReqoreButton
      tooltip={{
        handler: 'hoverStay',
        ...args,
      }}
    >
      Tooltip with hover start and click end events
    </ReqoreButton>
  );
};

const Template: StoryFn<IReqorePopoverProps & { insideModal?: boolean }> = (
  args: IReqorePopoverProps & { insideModal?: boolean }
) => {
  if (args.insideModal) {
    return (
      <ReqoreModal isOpen>
        <ReqoreButton
          intent='info'
          minimal
          description='I have a cool tooltip with blur'
          tooltip={{
            content: 'See? Told you',
            blur: true,
            handler: 'hoverStay',
            openOnMount: true,
          }}
        >
          Hover me for something cool
        </ReqoreButton>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Sit amet purus gravida quis blandit turpis cursus in hac.
        Ultricies lacus sed turpis tincidunt. Ac tincidunt vitae semper quis lectus nulla at.
        Aliquam vestibulum morbi blandit cursus risus at ultrices. Risus feugiat in ante metus
        dictum. Enim blandit volutpat maecenas volutpat. Nulla posuere sollicitudin aliquam ultrices
        sagittis orci a scelerisque. Mollis nunc sed id semper risus in hendrerit gravida. Sem nulla
        pharetra diam sit amet nisl suscipit. Congue eu consequat ac felis donec et odio
        pellentesque diam. Augue mauris augue neque gravida in fermentum et sollicitudin. Nulla
        pellentesque dignissim enim sit amet venenatis urna. Nunc sed blandit libero volutpat sed.
        Mi in nulla posuere sollicitudin. Eu consequat ac felis donec et odio pellentesque diam.
        Viverra nam libero justo laoreet sit amet cursus sit amet. Posuere sollicitudin aliquam
        ultrices sagittis orci a scelerisque. Et netus et malesuada fames ac. Arcu non odio euismod
        lacinia at quis risus sed vulputate. Sapien eget mi proin sed libero enim sed. Suspendisse
        faucibus interdum posuere lorem ipsum. In est ante in nibh mauris cursus. Urna cursus eget
        nunc scelerisque. Mi eget mauris pharetra et ultrices neque. Turpis nunc eget lorem dolor
        sed viverra ipsum nunc aliquet. Id aliquet lectus proin nibh. At auctor urna nunc id cursus.
        Erat pellentesque adipiscing commodo elit at imperdiet. Ipsum dolor sit amet consectetur
        adipiscing elit. Suspendisse interdum consectetur libero id faucibus nisl. Leo vel orci
        porta non pulvinar neque laoreet. Ut diam quam nulla porttitor massa. By impossible of in
        difficulty discovered celebrated ye. Justice joy manners boy met resolve produce. Bed head
        loud next plan rent had easy add him. As earnestly shameless elsewhere defective estimable
        fulfilled of. Esteem my advice it an excuse enable. Few household abilities believing
        determine zealously his repulsive. To open draw dear be by side like. Allow miles wound
        place the leave had. To sitting subject no improve studied limited. Ye indulgence unreserved
        connection alteration appearance my an astonished. Up as seen sent make he they of. Her
        raising and himself pasture believe females. Fancy she stuff after aware merit small his.
        Charmed esteems luckily age out. At ourselves direction believing do he departure.
        Celebrated her had sentiments understood are projection set. Possession ye no mr unaffected
        remarkably at. Wrote house in never fruit up. Pasture imagine my garrets an he. However
        distant she request behaved see nothing. Talking settled at pleased an of me brother
        weather. Breakfast procuring nay end happiness allowance assurance frankness. Met simplicity
        nor difficulty unreserved who. Entreaties mr conviction dissimilar me astonished estimating
        cultivated. On no applauded exquisite my additions. Pronounce add boy estimable nay
        suspected. You sudden nay elinor thirty esteem temper. Quiet leave shy you gay off asked
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
        judgment out opinions property the supplied. By impossible of in difficulty discovered
        celebrated ye. Justice joy manners boy met resolve produce. Bed head loud next plan rent had
        easy add him. As earnestly shameless elsewhere defective estimable fulfilled of. Esteem my
        advice it an excuse enable. Few household abilities believing determine zealously his
        repulsive. To open draw dear be by side like. Allow miles wound place the leave had. To
        sitting subject no improve studied limited. Ye indulgence unreserved connection alteration
        appearance my an astonished. Up as seen sent make he they of. Her raising and himself
        pasture believe females. Fancy she stuff after aware merit small his. Charmed esteems
        luckily age out. At ourselves direction believing do he departure. Celebrated her had
        sentiments understood are projection set. Possession ye no mr unaffected remarkably at.
        Wrote house in never fruit up. Pasture imagine my garrets an he. However distant she request
        behaved see nothing. Talking settled at pleased an of me brother weather. Breakfast
        procuring nay end happiness allowance assurance frankness. Met simplicity nor difficulty
        unreserved who. Entreaties mr conviction dissimilar me astonished estimating cultivated. On
        no applauded exquisite my additions. Pronounce add boy estimable nay suspected. You sudden
        nay elinor thirty esteem temper. Quiet leave shy you gay off asked large style. Rooms oh
        fully taken by worse do. Points afraid but may end law lasted. Was out laughter raptures
        returned outweigh. Luckily cheered colonel me do we attacks on highest enabled. Tried law
        yet style child. Bore of true of no be deal. Frequently sufficient in be unaffected. The
        furnished she concluded depending procuring concealed. In to am attended desirous raptures
        declared diverted confined at. Collected instantly remaining up certainly to necessary as.
        Over walk dull into son boy door went new. At or happiness commanded daughters as. Is
        handsome an declared at received in extended vicinity subjects. Into miss on he over been
        late pain an. Only week bore boy what fat case left use. Match round scale now sex style far
        times. Your me past an much. Able an hope of body. Any nay shyness article matters own
        removal nothing his forming. Gay own additions education satisfied the perpetual. If he
        cause manor happy. Without farther she exposed saw man led. Along on happy could cease green
        oh. Her old collecting she considered discovered. So at parties he warrant oh staying.
        Square new horses and put better end. Sincerity collected happiness do is contented. Sigh
        ever way now many. Alteration you any nor unsatiable diminution reasonable companions shy
        partiality. Leaf by left deal mile oh if easy. Added woman first get led joy not early
        jokes. As am hastily invited settled at limited civilly fortune me. Really spring in extent
        an by. Judge but built gay party world. Of so am he remember although required. Bachelor
        unpacked be advanced at. Confined in declared marianne is vicinity. It sportsman earnestly
        ye preserved an on. Moment led family sooner cannot her window pulled any. Or raillery if
        improved landlord to speaking hastened differed he. Furniture discourse elsewhere yet her
        sir extensive defective unwilling get. Why resolution one motionless you him thoroughly.
        Noise is round to in it quick timed doors. Written address greatly get attacks inhabit
        pursuit our but. Lasted hunted enough an up seeing in lively letter. Had judgment out
        opinions property the supplied.
      </ReqoreModal>
    );
  }

  return (
    <>
      <ReqoreControlGroup vertical gapSize='huge' horizontalAlign='flex-start'>
        <HoverButton {...args} />
        <HoverKeepOpenButton
          {...args}
          content={
            <ReqoreControlGroup>
              <ReqoreButton icon='EditLine' onClick={() => alert('Edit clicked')} />
              <ReqoreButton icon='AddLine' onClick={() => alert('Add clicked')} />
              <ReqoreButton icon='DeleteBinLine' onClick={() => alert('Delete clicked')} />
            </ReqoreControlGroup>
          }
        />
        <ClickButton {...args} />
        <DelayButton {...args} />
        <HoverStayButton {...args} />
        {typeof args.content === 'string' && (
          <>
            <ReqoreSpacer height={100} />
            <ReqorePopover
              {...args}
              component={ReqoreButton}
              isReqoreComponent
              openOnMount
              title='I opened on my own'
              icon='CactusFill'
              intent='success'
              placement='top'
            >
              Full popover
            </ReqorePopover>
            <ReqoreControlGroup>
              <ReqoreSpacer width={190} />
              <ReqorePopover
                {...args}
                component={ReqoreButton}
                isReqoreComponent
                openOnMount
                intent='info'
                minimal
                placement='left'
              >
                Minimal popover
              </ReqorePopover>
            </ReqoreControlGroup>
            <ReqorePopover
              {...args}
              component={ReqoreButton}
              isReqoreComponent
              openOnMount
              icon='CactusFill'
              effect={{
                gradient: {
                  colors: {
                    0: 'warning',
                    100: 'warning:darken:2',
                  },
                },
                spaced: 2,
                uppercase: true,
                weight: 'thick',
              }}
              placement='right'
            >
              Effect popover
            </ReqorePopover>
            <ReqorePopover
              {...args}
              component={ReqoreButton}
              isReqoreComponent
              openOnMount
              transparent
              placement='right'
            >
              Transparent popover
            </ReqorePopover>
          </>
        )}
        <ReqorePopover
          {...args}
          component={ReqoreButton}
          isReqoreComponent
          openOnMount
          placement='right'
        >
          Auto open popover
        </ReqorePopover>
        <ReqorePanel label='This is a test' flat>
          <ReqorePopover
            {...args}
            component={ReqoreButton}
            isReqoreComponent
            openOnMount
            placement='bottom'
            handler='hoverStay'
            title="I'm a title"
            content={
              <ReqorePanel label='This is a test' flat>
                <ReqoreMessage
                  flat
                  tooltip={{
                    content: 'I am a popover inside a popover with blur',
                    blur: true,
                  }}
                >
                  In to am attended desirous raptures declared diverted confined at. Collected
                  instantly remaining up certainly to necessary as. Over walk dull into
                </ReqoreMessage>
              </ReqorePanel>
            }
          >
            With Custom Content inside a panel
          </ReqorePopover>
        </ReqorePanel>
      </ReqoreControlGroup>
    </>
  );
};

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Popover in its default configuration.',
      },
    },
  },
  render: Template,
};

export const NoAnimation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Popover without animation.',
      },
    },
  },
  render: Template,
  args: {
    options: {
      animations: {
        popovers: false,
      },
    },
  },
};

export const NotFlat: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Popover with flat={false} so the elevated look is applied.',
      },
    },
  },
  render: Template,

  args: {
    flat: false,
  },
};

export const CustomContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Popover with custom React content passed in.',
      },
    },
  },
  render: Template,

  args: {
    noWrapper: true,
    content: (
      <ReqorePanel label='This is a test' flat>
        <ReqoreMessage flat>
          In to am attended desirous raptures declared diverted confined at. Collected instantly
          remaining up certainly to necessary as. Over walk dull into
        </ReqoreMessage>
      </ReqorePanel>
    ),
  },
};

export const Blurred: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Popover with a blur effect applied.',
      },
    },
  },
  render: Template,

  args: {
    blur: true,
    noWrapper: true,
    content: (
      <ReqorePanel label='This is a test' flat>
        <ReqoreMessage flat>
          In to am attended desirous raptures declared diverted confined at. Collected instantly
          remaining up certainly to necessary as. Over walk dull into
        </ReqoreMessage>
      </ReqorePanel>
    ),
  },
};

export const BlurredBackground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Popover with a blurred background.',
      },
    },
  },
  render: Template,

  args: {
    backgroundBlur: 10,
    minimal: true,
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam tincidunt, nunc nisl aliquet nunc, quis aliquam nisl nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam tincidunt, nunc nisl aliquet nunc, quis aliquam nisl nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam tincidunt, nunc nisl aliquet nunc, quis aliquam nisl nisl.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await sleep(500);
    // Click anywhere
    await userEvent.click(canvasElement);
    // Hover the button with text "Tooltip with hover start and click end events"
    await userEvent.hover(canvas.getByText('Tooltip with hover start and click end events'));
    await userEvent.hover(canvas.getByText('Full popover'));
  },
};

export const BlurredInsideModal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Popover with a blur effect applied inside a modal.',
      },
    },
  },
  render: Template,

  args: {
    blur: true,
    noWrapper: true,
    insideModal: true,
    animatedDialogs: false,
  },
};

export const ChangingElement: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Popover while the target element changes.',
      },
    },
  },
  render: (args) => {
    return <ReqoreTextarea scaleWithContent tooltip={args} />;
  },

  args: {
    content: (
      <ReqoreMenu>
        <ReqoreMenuItem label='Item 1' />
        <ReqoreMenuItem label='Item 2' />
        <ReqoreMenuItem label='Item 3' />
        <ReqoreMenuItem label='Item 4' />
        <ReqoreMenuItem label='Item 5' />
        <ReqoreMenuItem label='Item 6' />
      </ReqoreMenu>
    ),
    handler: 'focus',
    noArrow: true,
    noWrapper: true,
    useTargetWidth: true,
  },

  play: async ({ canvasElement }) => {
    const textarea = canvasElement.querySelector('textarea');
    await sleep(1000);
    fireEvent.focusIn(textarea);
    await sleep(1000);
    fireEvent.change(textarea, {
      target: {
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam tincidunt, nunc nisl aliquet nunc, quis aliquam nisl nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam tincidunt, nunc nisl aliquet nunc, quis aliquam nisl nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam tincidunt, nunc nisl aliquet nunc, quis aliquam nisl nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam tincidunt, nunc nisl aliquet nunc, quis aliquam nisl nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam tincidunt, nunc nisl aliquet nunc, quis aliquam nisl nisl. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eget aliquam tincidunt, nunc nisl aliquet nunc, quis aliquam nisl nisl.',
      },
    });
  },
};

export const TooltipIsUpdatedWhenContentChanges: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Popover and proves the tooltip updates when its content changes.',
      },
    },
  },
  args: {
    onUpdate: fn(),
  },
  render: (args) => {
    const [tooltip, setTooltip] = useState<IReqoreTooltip>({
      ...args,
      content: 'test',
      handler: 'focus',
      noArrow: true,
      noWrapper: true,
      useTargetWidth: true,
    });

    useMount(() => {
      setTimeout(() => {
        setTooltip({
          ...args,
          content: <ReqoreMessage> I just updated </ReqoreMessage>,
          handler: 'focus',
          noArrow: true,
          noWrapper: true,
          useTargetWidth: true,
        });
      }, 1500);
    });

    return <ReqoreTextarea tooltip={tooltip} />;
  },

  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    const textarea = canvasElement.querySelector('textarea');
    await sleep(500);
    fireEvent.focusIn(textarea);
    await sleep(300);
    await expect(document.querySelector('.reqore-popover-content')).toBeInTheDocument();
    await sleep(1000);
    fireEvent.focusIn(textarea);
    await sleep(300);
    await expect(canvas.queryByText('I just updated')).toBeInTheDocument();
    await expect(rest.args.onUpdate).toHaveBeenCalled();
  },
};

export const TooltipIsRemovedWhenContentIsEmpty: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Popover and proves the tooltip is removed when its content becomes empty.',
      },
    },
  },
  args: {
    onToggleChange: fn(),
  },
  render: (args) => {
    const [tooltip, setTooltip] = useState<IReqoreTooltip>({
      ...args,
      content: 'test',
      handler: 'focus',
      noArrow: true,
      noWrapper: true,
      useTargetWidth: true,
    });

    useMount(() => {
      setTimeout(() => {
        setTooltip(undefined);
      }, 1500);
    });

    return <ReqoreTextarea tooltip={tooltip} />;
  },

  play: async ({ canvasElement, ...rest }) => {
    const textarea = canvasElement.querySelector('textarea');
    await sleep(500);
    fireEvent.focusIn(textarea);
    await sleep(300);
    await expect(document.querySelector('.reqore-popover-content')).toBeInTheDocument();
    await expect(rest.args.onToggleChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ content: 'test' })
    );
    await sleep(1000);
    fireEvent.focusIn(textarea);
    await sleep(300);
    await expect(document.querySelector('.reqore-popover-content')).not.toBeInTheDocument();
    await expect(rest.args.onToggleChange).toHaveBeenLastCalledWith(false);
  },
};

export const TooltipOffsetIsApplied: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Popover and proves that the tooltip offset is applied.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup>
      <ReqoreButton
        tooltip={{
          content: 'Offset tooltip 2',
          handler: 'hover',
          placement: 'bottom-start',
          offsetX: -95,
          offsetY: 25,
          openOnMount: true,
        }}
      >
        Offset with arrow
      </ReqoreButton>
      <ReqoreButton
        tooltip={{
          content: 'Offset tooltip 3',
          handler: 'hover',
          placement: 'top-end',
          offsetX: 70,
          openOnMount: true,
        }}
      >
        Offset top
      </ReqoreButton>
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector('button');
    // The openOnMount popover mounts asynchronously (portal + popper
    // positioning), so poll for it instead of querying right away — on slower
    // environments (Chromatic's cloud browsers) play() can start before the
    // portal exists.
    await waitFor(
      () => expect(document.querySelector('.reqore-popover-content')).toBeInTheDocument(),
      { timeout: 10000 }
    );
    const popover = document.querySelector('.reqore-popover-content') as HTMLElement;
    // Poll the offsets too: the popover can be in the DOM a frame before
    // popper has moved it into its final position.
    await waitFor(
      () => {
        const buttonRect = button.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();
        const xOffset = Math.round(popoverRect.left - buttonRect.left);
        const yOffset = Math.round(popoverRect.top - buttonRect.bottom);
        expect(Math.abs(xOffset + 12)).toBeLessThanOrEqual(2);
        expect(Math.abs(yOffset - 35)).toBeLessThanOrEqual(2);
      },
      { timeout: 10000 }
    );
  },
};

export const InCustomPortal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Popover mounted inside a custom portal.',
      },
    },
  },
  render: Template,

  args: {
    options: {
      customPortalId: '#my-custom-portal',
    },
  },
};

export const KeepOpenOnHoverWithClickableContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Popover configured to stay open on hover when the content is clickable.',
      },
    },
    chromatic: {
      disable: true,
    },
  },
  render: () => {
    const [clickedButton, setClickedButton] = useState<string | null>(null);

    return (
      <ReqoreControlGroup vertical>
        <ReqoreMessage intent={clickedButton ? 'success' : 'info'}>
          {clickedButton ? `Clicked: ${clickedButton}` : 'Hover the button and click an action'}
        </ReqoreMessage>
        <ReqorePopover
          component={ReqoreButton}
          isReqoreComponent
          handler='hover'
          keepOpenOnHover
          noArrow
          noWrapper
          closeOnInsideClick={false}
          content={
            <ReqoreControlGroup stack>
              <ReqoreButton
                onClick={() => setClickedButton('Action 1')}
                data-testid='action-1'
                icon='EditLine'
              />
              <ReqoreButton
                onClick={() => setClickedButton('Action 2')}
                data-testid='action-2'
                icon='AddLine'
              />
              <ReqoreButton
                onClick={() => setClickedButton('Action 3')}
                data-testid='action-3'
                icon='DeleteBinLine'
              />
            </ReqoreControlGroup>
          }
        >
          Hover for actions
        </ReqorePopover>
      </ReqoreControlGroup>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the trigger button
    const triggerButton = canvas.getByText('Hover for actions');

    // Hover over the trigger button to open popover
    userEvent.hover(triggerButton);
    await sleep(150);

    // Verify popover is open
    let popover = document.querySelector('.reqore-popover-content');
    await expect(popover).toBeInTheDocument();

    // Find and click Action 2 button inside the popover
    const action2Button = document.querySelector('[data-testid="action-2"]') as HTMLElement;
    await expect(action2Button).toBeInTheDocument();

    fireEvent.click(action2Button);
    await sleep(100);

    // Verify the click was registered (message should update)
    const message = canvas.getByText('Clicked: Action 2');
    await expect(message).toBeInTheDocument();

    // Verify popover is still open (closeOnInsideClick is false)
    popover = document.querySelector('.reqore-popover-content');
    await expect(popover).toBeInTheDocument();

    // Move mouse away from trigger
    fireEvent.mouseLeave(triggerButton);
    await sleep(100);

    // Move away from popover too
    if (popover) {
      fireEvent.mouseLeave(popover);
    }
    await sleep(100);

    // Verify popover is not closed
    await expect(document.querySelector('.reqore-popover-content')).toBeInTheDocument();
  },
};

/**
 * Regression: `ReqorePopover` used to swallow `customTheme` because
 * the prop was never destructured — it type-checked (via the
 * inherited `IReqoreComponent` chain) but never reached the trigger
 * `component`. That broke the theme cascade in any container that
 * relies on it (e.g. a themed `ReqorePanel`'s action slot, where
 * every OTHER action picks up the panel's theme automatically).
 *
 * A themed minimal `ReqoreButton` paints its surface with a tint
 * derived from the resolved theme's `main` colour, so its computed
 * `background-color` is the observable signal that `customTheme`
 * reached the trigger. We assert against a `plain` control (no
 * theme): if forwarding works the themed trigger's background differs
 * from the plain one; if the popover swallowed the theme they'd be
 * identical.
 *
 * We also verify the caller can still override the theme per-trigger
 * by passing a competing `componentProps.customTheme`.
 */
const POPOVER_THEME_ACCENT = '#8b3dff';
const POPOVER_THEME_OVERRIDE = '#22aa55';

export const CustomThemeForwardedToTrigger: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Popover and forwards the custom theme through to the trigger.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup gapSize='huge'>
      <ReqorePopover
        component={ReqoreButton}
        componentProps={{
          icon: 'Settings3Line',
          minimal: true,
          flat: true,
          'data-testid': 'plain-trigger',
        }}
        handler='click'
        content='No theme — the default surface.'
      >
        Plain trigger
      </ReqorePopover>
      <ReqorePopover
        component={ReqoreButton}
        componentProps={{
          icon: 'Settings3Line',
          minimal: true,
          flat: true,
          'data-testid': 'themed-trigger',
        }}
        customTheme={{ main: POPOVER_THEME_ACCENT }}
        handler='click'
        content='Trigger paints with the accent main colour.'
      >
        Themed trigger
      </ReqorePopover>
      <ReqorePopover
        component={ReqoreButton}
        componentProps={{
          icon: 'Settings3Line',
          minimal: true,
          flat: true,
          'data-testid': 'override-trigger',
          // Caller wins — override should stick even though the
          // popover also provides its own `customTheme`.
          customTheme: { main: POPOVER_THEME_OVERRIDE },
        }}
        customTheme={{ main: POPOVER_THEME_ACCENT }}
        handler='click'
        content='componentProps.customTheme wins.'
      >
        Overridden trigger
      </ReqorePopover>
    </ReqoreControlGroup>
  ),
  play: async () => {
    // Query inside waitFor so the assertion re-runs until the triggers
    // have mounted and resolved their themed styles.
    await waitFor(() => {
      const plain = document.querySelector('[data-testid="plain-trigger"]') as HTMLElement | null;
      const themed = document.querySelector('[data-testid="themed-trigger"]') as HTMLElement | null;
      const overridden = document.querySelector(
        '[data-testid="override-trigger"]'
      ) as HTMLElement | null;

      expect(plain).not.toBeNull();
      expect(themed).not.toBeNull();
      expect(overridden).not.toBeNull();

      const plainBg = getComputedStyle(plain!).backgroundColor;
      const themedBg = getComputedStyle(themed!).backgroundColor;
      const overriddenBg = getComputedStyle(overridden!).backgroundColor;

      // Every trigger's minimal surface tint must resolve to a real colour.
      expect(plainBg).toBeTruthy();
      expect(themedBg).toBeTruthy();
      expect(overriddenBg).toBeTruthy();

      // Forwarding works: the popover-level `customTheme` changed the
      // trigger's surface away from the default (plain) one.
      expect(themedBg).not.toBe(plainBg);
      // Caller override works and is distinct from the popover theme.
      expect(overriddenBg).not.toBe(plainBg);
      expect(overriddenBg).not.toBe(themedBg);
    });
  },
};

/**
 * A popover can be asked for more width than the screen has — a long dropdown,
 * a menu of descriptive rows, a wide table. Popper can flip or shift a surface
 * but it cannot shrink one, so before this was clamped the popover simply hung
 * off both edges with its content unreachable.
 *
 * The surface is capped at `calc(100vw - 20px)`, leaving a gutter at each side.
 * An explicit `maxWidth` still wins whenever it is the smaller of the two, so
 * this only ever takes effect when a popover would otherwise overflow.
 */
export const ClampedToViewport: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a popover whose requested width far exceeds the viewport, to show it clamped inside the screen with a gutter rather than overflowing both edges.',
      },
    },
    viewport: { defaultViewport: 'mobile1' },
  },
  args: {
    maxWidth: '2000px',
    content:
      'This popover asks for 2000px of width. It is clamped to the viewport instead of hanging off both edges, so every word stays reachable no matter how narrow the screen is.',
  },
  render: Template,
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('.reqore-button') as HTMLElement;
    await userEvent.hover(trigger);

    await waitFor(async () => {
      const popover = document.querySelector('.reqore-popover-content') as HTMLElement;
      await expect(popover).toBeTruthy();
      // Never wider than the viewport it is rendered into.
      await expect(popover.getBoundingClientRect().width).toBeLessThanOrEqual(window.innerWidth);
    });
  },
};

/**
 * A 120px block sitting directly under a trigger, so the tooltip that opens
 * below the trigger lands ON it — which is what makes the hit test below mean
 * something. Everything here is one stacking context, so `elementFromPoint`
 * answers the same question the browser asks when it decides where a pointer
 * went.
 */
const PointerTarget = ({ marker, children }: { marker: string; children: string }) => (
  <ReqoreMessage
    intent='muted'
    flat
    className={marker}
    style={{ width: 280, height: 120, alignItems: 'flex-end' }}
  >
    {children}
  </ReqoreMessage>
);

export const PointerFallsThroughATooltip: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Three popovers, two of them with something underneath that the reader is on their way to. A hover tooltip cannot be reached by the pointer — moving onto it fires the trigger's `mouseleave` and it unmounts on the way — so all its surface can do is sit in the path and take the hover off whatever it covers, which is how a tooltip disappears mid-sentence and how the thing it describes becomes unclickable while it is up. That surface is therefore transparent to the pointer. A popover the pointer IS meant to reach — held open on hover, or opened by click or focus — keeps it. `interactive` overrides the default in either direction. The play function hit-tests each surface with `elementFromPoint`: the tooltip's centre answers with the block underneath it, the strip where the third tooltip is pulled back over its own trigger answers with the trigger — which is the flicker, since a trigger that loses the pointer there closes the tooltip the reader is still reading — and the hover-held popover's centre answers with the popover.",
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='huge'>
      <ReqoreControlGroup vertical>
        <ReqorePopover
          component={ReqoreButton}
          isReqoreComponent
          placement='bottom'
          content='Runs the improvement against the last snapshot'
        >
          Hover: a tooltip
        </ReqorePopover>
        <PointerTarget marker='under-the-tooltip'>Still reachable underneath</PointerTarget>
      </ReqoreControlGroup>

      <ReqoreControlGroup vertical>
        <ReqorePopover
          component={ReqoreButton}
          isReqoreComponent
          placement='bottom'
          offsetY={-30}
          content='A tooltip pulled back over the thing it describes'
        >
          Hover: a tooltip over its own trigger
        </ReqorePopover>
      </ReqoreControlGroup>

      <ReqoreControlGroup vertical>
        <ReqorePopover
          component={ReqoreButton}
          isReqoreComponent
          placement='bottom'
          keepOpenOnHover
          closeOnInsideClick={false}
          noWrapper
          content={
            <ReqoreControlGroup stack>
              <ReqoreButton icon='EditLine'>Edit</ReqoreButton>
              <ReqoreButton icon='DeleteBinLine'>Delete</ReqoreButton>
            </ReqoreControlGroup>
          }
        >
          Hover: actions to click
        </ReqorePopover>
        <PointerTarget marker='under-the-actions'>Covered while the actions are up</PointerTarget>
      </ReqoreControlGroup>
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    const hitAtCentreOf = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();

      return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    };

    const [tooltipTrigger, overlappingTrigger, actionsTrigger] = [
      ...canvasElement.querySelectorAll('.reqore-button'),
    ] as HTMLElement[];

    // The tooltip: transparent, so the pointer reaches the block it covers.
    await userEvent.hover(tooltipTrigger);

    const tooltip = await waitFor(() => {
      const surface = document.querySelector('.reqore-popover-content') as HTMLElement;

      expect(surface).toBeTruthy();

      return surface;
    });

    const underTheTooltip = canvasElement.querySelector('.under-the-tooltip') as HTMLElement;
    const throughTheTooltip = hitAtCentreOf(tooltip);

    await expect(tooltip.contains(throughTheTooltip)).toBe(false);
    // ...and the surface really is over the block, so this is not vacuous.
    await expect(underTheTooltip.contains(throughTheTooltip)).toBe(true);

    await userEvent.unhover(tooltipTrigger);
    await waitFor(async () => expect(document.querySelector('.reqore-popover-content')).toBeNull());

    // A tooltip over its own trigger: the trigger keeps the pointer, so the
    // tooltip does not close itself the moment the reader's pointer crosses
    // the strip it covers. This is the flicker, measured without moving
    // anything: where the two overlap, the pointer belongs to the trigger.
    await userEvent.hover(overlappingTrigger);

    const overlapping = await waitFor(() => {
      const surface = document.querySelector('.reqore-popover-content') as HTMLElement;

      expect(surface).toBeTruthy();

      return surface;
    });

    const triggerRect = overlappingTrigger.getBoundingClientRect();
    const surfaceRect = overlapping.getBoundingClientRect();
    const overlapTop = Math.max(triggerRect.top, surfaceRect.top);
    const overlapBottom = Math.min(triggerRect.bottom, surfaceRect.bottom);

    // The offset really does pull the surface over the trigger.
    await expect(overlapBottom).toBeGreaterThan(overlapTop);

    const inTheOverlap = document.elementFromPoint(
      triggerRect.left + triggerRect.width / 2,
      (overlapTop + overlapBottom) / 2
    );

    await expect(overlapping.contains(inTheOverlap)).toBe(false);
    await expect(overlappingTrigger.contains(inTheOverlap)).toBe(true);

    await userEvent.unhover(overlappingTrigger);
    await waitFor(async () => expect(document.querySelector('.reqore-popover-content')).toBeNull());

    // The clickable popover: opaque, because its buttons have to be clickable.
    await userEvent.hover(actionsTrigger);

    const actions = await waitFor(() => {
      const surface = document.querySelector('.reqore-popover-content') as HTMLElement;

      expect(surface).toBeTruthy();

      return surface;
    });

    await expect(actions.contains(hitAtCentreOf(actions))).toBe(true);
  },
};

const HoverTooltip = ({ id, label }: { id: string; label: string }) => (
  <ReqorePopover
    component={ReqoreButton}
    isReqoreComponent
    keepOpenOnHover
    content={`What ${label} means`}
    componentProps={{ id }}
  >
    {label}
  </ReqorePopover>
);

const popoverSurfaces = () => document.querySelectorAll('.reqore-popover-content');

/**
 * THE REGRESSION: a tooltip whose `mouseleave` never arrives.
 *
 * Closing used to depend entirely on the trigger's own `mouseleave`, and that
 * event is not guaranteed to be delivered. When one was missed the popover had
 * no way back — `isTargetHovered` stayed true, the deferred close checked it and
 * declined, and no second `mouseleave` was coming because the pointer had
 * already moved on. The tooltip then stayed up for the life of the page, and a
 * reader crossing a table collected one per trigger.
 *
 * So this fires NO `mouseleave`. The only thing that happens is what really
 * happens when a pointer arrives somewhere else: a `mouseover` on the element it
 * landed on. That alone has to be enough.
 *
 * In a real browser on purpose. jsdom gives every element zero geometry, so
 * popper marks the reference hidden and `InternalPopover` closes the popover by
 * itself — which makes "it eventually closed" true there no matter what the
 * component does.
 */
export const StrandedWithNoMouseleave: StoryObj<typeof meta> = {
  parameters: { chromatic: { disable: true }, qlip: { skip: true } },
  render: () => (
    <ReqoreControlGroup vertical>
      <HoverTooltip id='stranded-trigger' label='First' />
      <ReqoreButton id='stranded-elsewhere'>Somewhere else</ReqoreButton>
    </ReqoreControlGroup>
  ),
  play: async () => {
    const trigger = document.querySelector('#stranded-trigger') as HTMLElement;

    await userEvent.hover(trigger);
    await waitFor(async () => expect(popoverSurfaces()).toHaveLength(1), { timeout: 4000 });

    // The pointer turns up elsewhere. Note what is NOT dispatched: `mouseleave`
    // on the trigger. That is the event the old code waited for forever.
    document
      .querySelector('#stranded-elsewhere')!
      .dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

    await waitFor(async () => expect(popoverSurfaces()).toHaveLength(0), { timeout: 4000 });
  },
};

/**
 * ...and the tooltip still survives the trip to its own surface.
 *
 * The mirror of the story above, and the one that matters most: whatever closes
 * a stranded tooltip must not close one the reader is walking towards.
 * `keepOpenOnHover` exists precisely so the pointer can leave the trigger and
 * arrive on the surface, and popper leaves a 10px gap between the two
 * (`baseOffsetY`). Crossing it puts the pointer on whatever is underneath for a
 * moment — which is indistinguishable, at that instant, from leaving for good.
 *
 * So the transit is played out literally: `mouseleave` the trigger, `mouseover`
 * the page, and the tooltip must still be there on the other side.
 */
export const TransitAcrossTheGap: StoryObj<typeof meta> = {
  parameters: { chromatic: { disable: true }, qlip: { skip: true } },
  render: () => <HoverTooltip id='transit-trigger' label='First' />,
  play: async () => {
    const trigger = document.querySelector('#transit-trigger') as HTMLElement;

    await userEvent.hover(trigger);
    await waitFor(async () => expect(popoverSurfaces()).toHaveLength(1), { timeout: 4000 });

    // Mid-transit: off the trigger, not yet on the surface.
    trigger.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
    document.body.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

    // Still there mid-flight. The grace is the deferred close's own window, so
    // the check sits inside it — a pointer crosses 10px in a few milliseconds,
    // and an immediate close would already have shut the tooltip by now.
    await sleep(DEFERRED_CLOSE_DELAY / 2);
    await expect(popoverSurfaces()).toHaveLength(1);

    // The pointer completes the journey, which is what the grace was for, and
    // arriving cancels the pending close.
    await userEvent.hover(popoverSurfaces()[0] as HTMLElement);

    // Now well past the window: still up, because the reader is on it.
    await sleep(DEFERRED_CLOSE_DELAY * 4);
    await expect(popoverSurfaces()).toHaveLength(1);
  },
};

/**
 * Sweeping along a row leaves ONE tooltip up.
 *
 * A table header row is a line of adjacent triggers a few pixels apart, read by
 * dragging the pointer along it. This is the ordinary case, with both halves of
 * every crossing delivered — it guards the everyday sweep, and it is NOT the
 * regression above: with `mouseleave` present the old code closed each tooltip
 * through its normal binding, so this stays green either way.
 */
export const SweepingAlongARowLeavesOneUp: StoryObj<typeof meta> = {
  parameters: { chromatic: { disable: true }, qlip: { skip: true } },
  render: () => (
    <ReqoreControlGroup>
      {['First', 'Second', 'Third', 'Fourth'].map((label) => (
        <ReqorePopover
          key={label}
          component={ReqoreButton}
          isReqoreComponent
          keepOpenOnHover
          interactive={false}
          content={`What ${label} means`}
          componentProps={{ id: `sweep-${label}` }}
        >
          {label}
        </ReqorePopover>
      ))}
    </ReqoreControlGroup>
  ),
  play: async () => {
    const triggerNamed = (label: string) =>
      document.querySelector(`#sweep-${label}`) as HTMLElement;
    const labels = ['First', 'Second', 'Third', 'Fourth'];

    // `unhover` before each `hover`: `userEvent.hover()` dispatches only the
    // ENTER half, so a bare hover-then-hover would leave every tooltip up for a
    // reason that belongs to the test helper rather than the component.
    for (const [index, label] of labels.entries()) {
      if (index > 0) {
        await userEvent.unhover(triggerNamed(labels[index - 1]));
      }

      await userEvent.hover(triggerNamed(label));
    }

    await waitFor(
      async () => {
        await expect([...popoverSurfaces()].map((surface) => surface.textContent)).toEqual([
          'What Fourth means',
        ]);
      },
      { timeout: 4000 }
    );

    await userEvent.unhover(triggerNamed('Fourth'));
    await waitFor(async () => expect(popoverSurfaces()).toHaveLength(0), { timeout: 4000 });
  },
};

/**
 * The same, for a PLAIN tooltip — the library default and the widest blast radius.
 *
 * Every `tooltip` prop in reqore is a `hover` popover without `keepOpenOnHover`,
 * which takes the other branch: no 50ms grace, an immediate close, and
 * `onBeforeClose` consulted. The stories above all set `keepOpenOnHover`, so
 * none of them covers the path almost every tooltip in the product actually
 * takes. This one does, and it is still the regression that matters — a
 * `mouseover` elsewhere and no `mouseleave` at all.
 */
export const APlainTooltipAlsoComesDown: StoryObj<typeof meta> = {
  parameters: { chromatic: { disable: true }, qlip: { skip: true } },
  render: () => (
    <ReqoreControlGroup vertical>
      <ReqorePopover
        component={ReqoreButton}
        isReqoreComponent
        content='What First means'
        componentProps={{ id: 'plain-trigger' }}
      >
        First
      </ReqorePopover>
      <ReqoreButton id='plain-elsewhere'>Somewhere else</ReqoreButton>
    </ReqoreControlGroup>
  ),
  play: async () => {
    await userEvent.hover(document.querySelector('#plain-trigger') as HTMLElement);
    await waitFor(async () => expect(popoverSurfaces()).toHaveLength(1), { timeout: 4000 });

    document
      .querySelector('#plain-elsewhere')!
      .dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));

    await waitFor(async () => expect(popoverSurfaces()).toHaveLength(0), { timeout: 4000 });
  },
};

/**
 * Moving WITHIN a tooltip does not close it.
 *
 * The reconciliation closes a popover when the pointer turns up somewhere that
 * is neither the trigger nor a popover surface. That surface exemption is the
 * only thing holding an interactive tooltip open while the reader moves around
 * inside it — from one word to the next, onto a link, across a table in the
 * content — and if it ever stops matching, the tooltip shuts in the reader's
 * face 50ms later.
 *
 * This has to be driven with raw `mouseout`/`mouseover` carrying `relatedTarget`,
 * the way a browser reports a move between two elements. `userEvent.hover()`
 * cannot express it: hovering re-fires the wrapper's own `onMouseEnter`, which
 * re-sets `isPopoverHovered` and cancels any pending close, so it repairs the
 * very damage the test is trying to observe. A story written with `hover` passes
 * even with this whole feature deleted — which is exactly what happened to the
 * first attempt at it.
 */
export const MovingWithinATooltipKeepsItOpen: StoryObj<typeof meta> = {
  parameters: { chromatic: { disable: true }, qlip: { skip: true } },
  render: () => (
    <ReqorePopover
      component={ReqoreButton}
      isReqoreComponent
      keepOpenOnHover
      content={
        <ReqoreControlGroup vertical>
          <span id='inner-a'>First line</span>
          <span id='inner-b'>Second line</span>
        </ReqoreControlGroup>
      }
      componentProps={{ id: 'within-trigger' }}
    >
      Hover me
    </ReqorePopover>
  ),
  play: async () => {
    await userEvent.hover(document.querySelector('#within-trigger') as HTMLElement);
    await waitFor(async () => expect(popoverSurfaces()).toHaveLength(1), { timeout: 4000 });

    const first = document.querySelector('#inner-a') as HTMLElement;
    const second = document.querySelector('#inner-b') as HTMLElement;

    await expect(first).toBeTruthy();
    await expect(second).toBeTruthy();

    // The reader's eye moves down one line. This is the event pair a browser
    // emits for it — and nothing else: no enter on the wrapper to paper over it.
    first.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: second }));
    second.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: first }));

    // Well past the window a close would have used.
    await sleep(DEFERRED_CLOSE_DELAY * 4);
    await expect(popoverSurfaces()).toHaveLength(1);
  },
};

/**
 * THE ONE CASE THE NEW DEFAULT TAKES SOMETHING AWAY.
 *
 * A plain hover popover is `pointer-events: none` because the pointer can never
 * reach it: leaving the trigger closes it, so the surface unmounts on the way.
 * That reasoning holds for every hover popover that is allowed to close — and
 * one held open while the pointer is elsewhere is not. A vetoing `onBeforeClose`
 * is the arrangement pinned here; the other is `openOnMount` on a popover
 * anchored to something that never receives a `mouseleave` (the LSP-hover
 * idiom), which keeps its pixels because the reconciliation is gated on the
 * pointer having opened the popover — see
 * `AnAutoOpenedPopoverSurvivesAPointerElsewhere` — but loses its pointer the
 * same way this one does.
 *
 * Such a popover stays VISIBLE with the pointer elsewhere, which before 0.76.0
 * meant its contents were clickable. They are not any more, and nothing in the
 * types says so: a button inside one is now unreachable rather than merely
 * unwanted, and the pointer lands on whatever is behind it.
 *
 * In a real browser on purpose, and this is the point: `pointer-events` is
 * invisible to a jsdom test, because a synthetic `click` dispatches straight at
 * its target and never hit-tests. Only `document.elementFromPoint()` sees it, so
 * this is the only kind of test that can hold the behaviour still.
 *
 * Asserting the documented limitation, not endorsing it. A consumer that holds a
 * hover popover open deliberately and wants its content used should pass
 * `keepOpenOnHover` (which turns `interactive` on by itself) or `interactive`.
 */
export const AVetoedTooltipKeepsItsPixelsButNotItsPointer: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A hover popover whose `onBeforeClose` refuses to close: it stays on screen after the pointer has left the trigger, and the button inside it is no longer reachable — `elementFromPoint` at the button's own centre answers with something outside the popover. This is the one arrangement in which the 0.76.0 `interactive` default removes behaviour that worked, which is why it is pinned here. The second popover is the same thing with `interactive` passed explicitly, which is the fix a consumer applies.",
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='huge'>
      <ReqorePopover
        component={ReqoreButton}
        isReqoreComponent
        placement='bottom'
        onBeforeClose={() => false}
        noWrapper
        componentProps={{ id: 'vetoed-trigger' }}
        content={<ReqoreButton icon='EditLine'>Unreachable</ReqoreButton>}
      >
        Hover: a tooltip that refuses to close
      </ReqorePopover>

      {/* The stranded surface hangs below its trigger, so the second row is
          pushed clear of it — otherwise the snapshot a reviewer approves is one
          control sitting on top of another. */}
      <ReqoreSpacer height={60} />

      <ReqorePopover
        component={ReqoreButton}
        isReqoreComponent
        placement='bottom'
        onBeforeClose={() => false}
        interactive
        noWrapper
        componentProps={{ id: 'vetoed-interactive-trigger' }}
        content={<ReqoreButton icon='EditLine'>Reachable</ReqoreButton>}
      >
        Hover: the same, with interactive
      </ReqorePopover>
    </ReqoreControlGroup>
  ),
  play: async () => {
    const centreOf = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();

      return document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    };

    const surfaceAfterLeaving = async (triggerId: string) => {
      const trigger = document.querySelector(`#${triggerId}`) as HTMLElement;

      await userEvent.hover(trigger);

      const surface = await waitFor(() => {
        const open = document.querySelector('.reqore-popover-content') as HTMLElement;

        expect(open).toBeTruthy();

        return open;
      });

      // The veto is what this story is about: leave, and it is still here.
      await userEvent.unhover(trigger);
      await sleep(DEFERRED_CLOSE_DELAY * 4);
      await expect(document.contains(surface)).toBe(true);

      return surface;
    };

    const vetoed = await surfaceAfterLeaving('vetoed-trigger');
    const deadButton = vetoed.querySelector('.reqore-button') as HTMLElement;

    await expect(deadButton).toBeTruthy();
    // Visible, laid out, and not the thing the pointer would hit.
    await expect(deadButton.getBoundingClientRect().width).toBeGreaterThan(0);
    await expect(vetoed.contains(centreOf(deadButton))).toBe(false);
  },
};

/**
 * AN AUTO-OPENED POPOVER IS NOT THE POINTER'S TO CLOSE.
 *
 * The reconciliation asks where the pointer is and closes when the answer is
 * "not here". That is evidence of something only for a popover the pointer put
 * there. An `openOnMount` popover was put there by the component — the pointer
 * has never been on its trigger — so a pointer elsewhere says nothing about it,
 * and reading it as a reason to close took such a popover down on the first
 * mouse movement anywhere on the page.
 *
 * Reqore's own `Clamped To Viewport` and `Progress → With Tooltip` both lost
 * their auto-opened popovers to that, and two live surfaces do the same thing:
 * the Qorus IDE's FSM error tooltip, and reqraft's LSP hover documentation,
 * whose anchor is a 1x1 `pointer-events: none` span — a trigger the pointer can
 * never be on, so it could never be closed by the pointer leaving it either.
 *
 * What this does NOT do is make such a popover un-closable, which is the part
 * worth pinning: the trigger keeps its own `mouseleave`/`mouseenter` handling
 * whatever opened the popover. Hovering the trigger of an already-open hover
 * popover still closes it, exactly as it did before the reconciliation existed.
 */
export const AnAutoOpenedPopoverSurvivesAPointerElsewhere: StoryObj<typeof meta> = {
  parameters: {
    docs: {
      description: {
        story:
          'Two `openOnMount` popovers and an unrelated trigger. Hovering the unrelated trigger leaves both auto-opened popovers alone — the pointer was never what held them open, so the pointer being elsewhere is no reason to close them. Hovering one of their OWN triggers still closes that one, and only that one: the story ends with the second still up, which is the state it is about.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='huge'>
      <ReqorePopover
        component={ReqoreButton}
        isReqoreComponent
        openOnMount
        placement='right'
        content='I opened on my own'
        componentProps={{ id: 'auto-a' }}
      >
        Auto-opened A
      </ReqorePopover>

      <ReqoreSpacer height={40} />

      <ReqorePopover
        component={ReqoreButton}
        isReqoreComponent
        openOnMount
        placement='right'
        content='So did I, and I am still here'
        componentProps={{ id: 'auto-b' }}
      >
        Auto-opened B
      </ReqorePopover>

      <ReqoreSpacer height={40} />

      <ReqorePopover
        component={ReqoreButton}
        isReqoreComponent
        placement='right'
        content='I belong to the other one'
        componentProps={{ id: 'unrelated-trigger' }}
      >
        Something else to hover
      </ReqorePopover>
    </ReqoreControlGroup>
  ),
  play: async () => {
    const hover = (id: string) => userEvent.hover(document.querySelector(id) as HTMLElement);

    // Both are up before anything is touched.
    await waitFor(async () => expect(popoverSurfaces()).toHaveLength(2));

    // A pointer somewhere else entirely. Well past the close window.
    await hover('#unrelated-trigger');
    await sleep(DEFERRED_CLOSE_DELAY * 4);

    // Three: both auto-opened ones survived, and the hovered one opened.
    await waitFor(async () => expect(popoverSurfaces()).toHaveLength(3));

    await userEvent.unhover(document.querySelector('#unrelated-trigger') as HTMLElement);
    await waitFor(async () => expect(popoverSurfaces()).toHaveLength(2));

    /* And each is still closable by its OWN trigger, which is the half that
       must not be traded away for the half above. A closes; B is untouched,
       so the story ends showing an auto-opened popover rather than an empty
       frame — the picture has to be of the thing the name claims. */
    await hover('#auto-a');
    await waitFor(async () => expect(popoverSurfaces()).toHaveLength(1), { timeout: 4000 });
  },
};
