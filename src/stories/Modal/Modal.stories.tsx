import { expect, fireEvent, waitFor } from 'storybook/test';
import { StoryFn, StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import { useState } from 'react';
import { useMount } from 'react-use';
import { _testsClickButton, _testsWaitForText } from '../../../__tests__/utils';
import { IReqoreModalProps } from '../../components/Modal';
import { sleep } from '../../helpers/utils';
import {
  ReqoreCollection,
  ReqoreModal,
  ReqoreP,
  ReqorePanel,
  useReqoreProperty,
} from '../../index';
import { StoryMeta } from '../utils';
import { FlatArg, IntentArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreModalProps>();

const meta = {
  title: 'Dialogs/Modal',
  component: ReqoreModal,
  args: {
    isOpen: true,
    label: 'This is a test',
    blur: 3,
    opacity: 1,
    hasBackdrop: true,
    width: '80vw',
    height: '50vh',
  },
  argTypes: {
    ...IntentArg,
    ...FlatArg,
    ...createArg('isOpen', {
      type: 'boolean',
      defaultValue: true,
      name: 'Is Open',
      description: 'Whether the modal is open or not',
    }),
    ...createArg('label', {
      defaultValue: 'This is a test',
      name: 'Label',
      type: 'string',
    }),
    ...createArg('blur', {
      defaultValue: 3,
      name: 'Backdrop blur',
      type: 'number',
    }),
    ...createArg('opacity', {
      defaultValue: 1,
      name: 'Modal Opacity',
      type: 'number',
    }),
    ...createArg('hasBackdrop', {
      defaultValue: true,
      name: 'Has Backdrop',
      type: 'boolean',
    }),
    ...createArg('width', {
      defaultValue: '80vw',
      name: 'Width',
      type: 'string',
    }),
    ...createArg('height', {
      defaultValue: '50vh',
      name: 'Height',
      type: 'string',
    }),
    /* The resize FLOORS, as distinct from the sizes above: those are where the
       modal opens, these are how small a drag may take it. Discoverable here
       because a consumer who does not know they exist declares neither, and
       inherits a floor sized for reqore's chrome rather than for their own
       content. */
    ...createArg('minWidth', {
      name: 'Minimum width',
      type: 'string',
      description:
        "The width the modal cannot be dragged below. Defaults to `minSize`, then to `MODAL_MIN_WIDTH` (200px). Units: `px`, `%`, `vw`, `vh` only — anything else (a bare number, `rem`, `em`, `vmin`, `vmax`) reads as NaN in the drag clamp and the floor is lost.",
    }),
    ...createArg('minHeight', {
      name: 'Minimum height',
      type: 'string',
      description:
        "The height the modal cannot be dragged below. Defaults to `minSize`, then to `MODAL_MIN_HEIGHT` (80px). Same unit rule as `minWidth`.",
    }),
    ...createArg('minSize', {
      name: 'Minimum size (both axes)',
      type: 'string',
      description:
        'The floor for whichever of `minWidth` / `minHeight` is not given. On an edge drawer it is the only floor, and defaults to `DRAWER_MIN_SIZE` (150px). Same unit rule as `minWidth`.',
    }),
  },
} as StoryMeta<typeof ReqoreModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<
  IReqoreModalProps & { confirm?: boolean; modalProps?: IReqoreModalProps }
> = ({ modalProps, ...args }) => {
  const [isOpen, setIsOpen] = useState(args.isOpen);
  const confirmAction = useReqoreProperty('confirmAction');
  const [count, setCount] = useState(0);

  const handleConfirm = () => {
    confirmAction({
      content: 'How is the wheather going to be?',
      label: 'Tell me something',
      onConfirm: noop,
      onCancel: noop,
      modalProps: modalProps,
    });
    setCount(count + 1);
  };

  useMount(() => {
    console.log(args);
    if (args.confirm) {
      handleConfirm();
    }
  });

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
      <ReqoreModal
        {...args}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        bottomActions={[
          { label: 'Confirm', intent: 'success', position: 'right', onClick: handleConfirm },
          { label: 'Cancel', intent: 'danger', position: 'left' },
        ]}
      >
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
    </>
  );
};

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Modal in its default configuration.',
      },
    },
  },
  render: Template,
};

export const ConfirmationModal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Modal with the confirmation modal wired in.',
      },
    },
  },
  render: Template,

  args: {
    confirm: true,
  },
};

export const BasicWithConfirmationOnClose: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Modal with a confirmation dialog on close.',
      },
    },
  },
  render: Template,

  args: {
    confirmOnClose: {
      label: 'You sure?',
      intent: 'warning',
      content: 'Are you sure you want to close this modal?',
      cancelIcon: 'EmotionHappyLine',
      confirmIcon: 'EmotionSadLine',
      confirmLabel: 'Yes',
      cancelButtonIntent: 'info',
    },
  },

  play: async () => {
    await _testsWaitForText('This is a test');
    await fireEvent.click(document.querySelector('.reqore-drawer-close-button'));
    await _testsWaitForText('Are you sure you want to close this modal?');
  },
};

export const CustomZIndex: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Modal with a custom z-index applied.',
      },
    },
  },
  render: Template,

  args: {
    confirm: true,
    customZIndex: 99999,
  },
};

export const CustomZIndexOnConfirmationDialog: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Modal with a custom z-index applied to the confirmation dialog.',
      },
    },
  },
  render: Template,

  args: {
    confirm: true,
    customZIndex: 99999,
    // @ts-ignore
    modalProps: {
      customZIndex: 100000,
      children: <ReqoreP intent='pending'> Hello there, You did not expect me did you. </ReqoreP>,
    },
  },
};

export const CanBeClosedWithEscKey: Story = {
  ...Basic,
  parameters: {
    docs: {
      description: {
        story:
          'Renders Modal and closes it via the Escape key.',
      },
    },
    chromatic: { disable: true },
  },
  play: async ({ canvasElement }) => {
    await _testsWaitForText('This is a test');
    await fireEvent.keyDown(canvasElement, { key: 'Escape' });
    await sleep(1000);
    await expect(document.querySelector('.reqore-modal')).not.toBeInTheDocument();
  },
};

export const CanBeClosedWithEscKeyWithConfirmation: Story = {
  ...BasicWithConfirmationOnClose,
  args: {
    ...BasicWithConfirmationOnClose.args,
    confirmOnClose: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders Modal and closes it via Escape with a confirmation prompt.',
      },
    },
    chromatic: { disable: true },
  },
  play: async ({ canvasElement }) => {
    await _testsWaitForText('This is a test');
    await fireEvent.keyDown(canvasElement, { key: 'Escape' });
    await _testsWaitForText('Are you sure you want to proceed?');
    await _testsClickButton({ label: 'Confirm', nth: 1 });
    await sleep(1000);
    await expect(document.querySelector('.reqore-modal')).not.toBeInTheDocument();
  },
};

export const EscKeyClosestOnlyTopModal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Modal in a modal stack — Escape closes only the top-most modal.',
      },
    },
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(true);
    const [secondIsOpen, setSecondIsOpen] = useState(true);

    return (
      <>
        <ReqorePanel label='Just some background text' padded>
          By impossible of in difficulty discovered celebrated ye. Justice joy manners boy met
          resolve produce. Bed head loud next plan rent had easy add him. As earnestly shameless
          elsewhere defective estimable fulfilled of. Esteem my advice it an excuse enable. Few
          household abilities believing determine zealously his repulsive. To open draw dear be by
          side like. Allow miles wound place the leave had. To sitting subject no improve studied
          limited. Ye indulgence unreserved connection alteration appearance my an astonished. Up as
          seen sent make he they of. Her raising and himself pasture believe females. Fancy she
          stuff after aware merit small his. Charmed esteems luckily age out. At ourselves direction
          believing do he departure. Celebrated her had sentiments understood are projection set.
          Possession ye no mr unaffected remarkably at. Wrote house in never fruit up. Pasture
          imagine my garrets an he. However distant she request behaved see nothing. Talking settled
          at pleased an of me brother weather. Breakfast procuring nay end happiness allowance
          assurance frankness. Met simplicity nor difficulty unreserved who. Entreaties mr
          conviction dissimilar me astonished estimating cultivated. On no applauded exquisite my
          additions. Pronounce add boy estimable nay suspected. You sudden nay elinor thirty esteem
          temper. Quiet leave shy you gay off asked large style. Rooms oh fully taken by worse do.
          Points afraid but may end law lasted. Was out laughter raptures returned outweigh. Luckily
          cheered colonel me do we attacks on highest enabled. Tried law yet style child. Bore of
          true of no be deal. Frequently sufficient in be unaffected. The furnished she concluded
          depending procuring concealed. In to am attended desirous raptures declared diverted
          confined at. Collected instantly remaining up certainly to necessary as. Over walk dull
          into son boy door went new. At or happiness commanded daughters as. Is handsome an
          declared at received in extended vicinity subjects. Into miss on he over been late pain
          an. Only week bore boy what fat case left use. Match round scale now sex style far times.
          Your me past an much. Able an hope of body. Any nay shyness article matters own removal
          nothing his forming. Gay own additions education satisfied the perpetual. If he cause
          manor happy. Without farther she exposed saw man led. Along on happy could cease green oh.
          Her old collecting she considered discovered. So at parties he warrant oh staying. Square
          new horses and put better end. Sincerity collected happiness do is contented. Sigh ever
          way now many. Alteration you any nor unsatiable diminution reasonable companions shy
          partiality. Leaf by left deal mile oh if easy. Added woman first get led joy not early
          jokes. As am hastily invited settled at limited civilly fortune me. Really spring in
          extent an by. Judge but built gay party world. Of so am he remember although required.
          Bachelor unpacked be advanced at. Confined in declared marianne is vicinity. It sportsman
          earnestly ye preserved an on. Moment led family sooner cannot her window pulled any. Or
          raillery if improved landlord to speaking hastened differed he. Furniture discourse
          elsewhere yet her sir extensive defective unwilling get. Why resolution one motionless you
          him thoroughly. Noise is round to in it quick timed doors. Written address greatly get
          attacks inhabit pursuit our but. Lasted hunted enough an up seeing in lively letter. Had
          judgment out opinions property the supplied.
        </ReqorePanel>
        <ReqoreModal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          bottomActions={[
            { label: 'Confirm', intent: 'success', position: 'right' },
            { label: 'Cancel', intent: 'danger', position: 'left' },
          ]}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Sit amet purus gravida quis blandit turpis cursus in
          hac. Ultricies lacus sed turpis tincidunt. Ac tincidunt vitae semper quis lectus nulla at.
          Aliquam vestibulum morbi blandit cursus risus at ultrices. Risus feugiat in ante metus
          dictum. Enim blandit volutpat maecenas volutpat. Nulla posuere sollicitudin aliquam
          ultrices sagittis orci a scelerisque. Mollis nunc sed id semper risus in hendrerit
          gravida. Sem nulla pharetra diam sit amet nisl suscipit. Congue eu consequat ac felis
          donec et odio pellentesque diam. Augue mauris augue neque gravida in fermentum et
          sollicitudin. Nulla pellentesque dignissim enim sit amet venenatis urna. Nunc sed blandit
          libero volutpat sed. Mi in nulla posuere sollicitudin. Eu consequat ac felis donec et odio
          pellentesque diam. Viverra nam libero justo laoreet sit amet cursus sit amet. Posuere
          sollicitudin aliquam ultrices sagittis orci a scelerisque. Et netus et malesuada fames ac.
          Arcu non odio euismod lacinia at quis risus sed vulputate. Sapien eget mi proin sed libero
          enim sed. Suspendisse faucibus interdum posuere lorem ipsum. In est ante in nibh mauris
          cursus. Urna cursus eget nunc scelerisque. Mi eget mauris pharetra et ultrices neque.
          Turpis nunc eget lorem dolor sed viverra ipsum nunc aliquet. Id aliquet lectus proin nibh.
          At auctor urna nunc id cursus. Erat pellentesque adipiscing commodo elit at imperdiet.
          Ipsum dolor sit amet consectetur adipiscing elit. Suspendisse interdum consectetur libero
          id faucibus nisl. Leo vel orci porta non pulvinar neque laoreet. Ut diam quam nulla
          porttitor massa. By impossible of in difficulty discovered celebrated ye. Justice joy
          manners boy met resolve produce. Bed head loud next plan rent had easy add him. As
          earnestly shameless elsewhere defective estimable fulfilled of. Esteem my advice it an
          excuse enable. Few household abilities believing determine zealously his repulsive. To
          open draw dear be by side like. Allow miles wound place the leave had. To sitting subject
          no improve studied limited. Ye indulgence unreserved connection alteration appearance my
          an astonished. Up as seen sent make he they of. Her raising and himself pasture believe
          females. Fancy she stuff after aware merit small his. Charmed esteems luckily age out. At
          ourselves direction believing do he departure. Celebrated her had sentiments understood
          are projection set. Possession ye no mr unaffected remarkably at. Wrote house in never
          fruit up. Pasture imagine my garrets an he. However distant she request behaved see
          nothing. Talking settled at pleased an of me brother weather. Breakfast procuring nay end
          happiness allowance assurance frankness. Met simplicity nor difficulty unreserved who.
          Entreaties mr conviction dissimilar me astonished estimating cultivated. On no applauded
          exquisite my additions. Pronounce add boy estimable nay suspected. You sudden nay elinor
          thirty esteem temper. Quiet leave shy you gay off asked large style. Rooms oh fully taken
          by worse do. Points afraid but may end law lasted. Was out laughter raptures returned
          outweigh. Luckily cheered colonel me do we attacks on highest enabled. Tried law yet style
          child. Bore of true of no be deal. Frequently sufficient in be unaffected. The furnished
          she concluded depending procuring concealed. In to am attended desirous raptures declared
          diverted confined at. Collected instantly remaining up certainly to necessary as. Over
          walk dull into son boy door went new. At or happiness commanded daughters as. Is handsome
          an declared at received in extended vicinity subjects. Into miss on he over been late pain
          an. Only week bore boy what fat case left use. Match round scale now sex style far times.
          Your me past an much. Able an hope of body. Any nay shyness article matters own removal
          nothing his forming. Gay own additions education satisfied the perpetual. If he cause
          manor happy. Without farther she exposed saw man led. Along on happy could cease green oh.
          Her old collecting she considered discovered. So at parties he warrant oh staying. Square
          new horses and put better end. Sincerity collected happiness do is contented. Sigh ever
          way now many. Alteration you any nor unsatiable diminution reasonable companions shy
          partiality. Leaf by left deal mile oh if easy. Added woman first get led joy not early
          jokes. As am hastily invited settled at limited civilly fortune me. Really spring in
          extent an by. Judge but built gay party world. Of so am he remember although required.
          Bachelor unpacked be advanced at. Confined in declared marianne is vicinity. It sportsman
          earnestly ye preserved an on. Moment led family sooner cannot her window pulled any. Or
          raillery if improved landlord to speaking hastened differed he. Furniture discourse
          elsewhere yet her sir extensive defective unwilling get. Why resolution one motionless you
          him thoroughly. Noise is round to in it quick timed doors. Written address greatly get
          attacks inhabit pursuit our but. Lasted hunted enough an up seeing in lively letter. Had
          judgment out opinions property the supplied. By impossible of in difficulty discovered
          celebrated ye. Justice joy manners boy met resolve produce. Bed head loud next plan rent
          had easy add him. As earnestly shameless elsewhere defective estimable fulfilled of.
          Esteem my advice it an excuse enable. Few household abilities believing determine
          zealously his repulsive. To open draw dear be by side like. Allow miles wound place the
          leave had. To sitting subject no improve studied limited. Ye indulgence unreserved
          connection alteration appearance my an astonished. Up as seen sent make he they of. Her
          raising and himself pasture believe females. Fancy she stuff after aware merit small his.
          Charmed esteems luckily age out. At ourselves direction believing do he departure.
          Celebrated her had sentiments understood are projection set. Possession ye no mr
          unaffected remarkably at. Wrote house in never fruit up. Pasture imagine my garrets an he.
          However distant she request behaved see nothing. Talking settled at pleased an of me
          brother weather. Breakfast procuring nay end happiness allowance assurance frankness. Met
          simplicity nor difficulty unreserved who. Entreaties mr conviction dissimilar me
          astonished estimating cultivated. On no applauded exquisite my additions. Pronounce add
          boy estimable nay suspected. You sudden nay elinor thirty esteem temper. Quiet leave shy
          you gay off asked large style. Rooms oh fully taken by worse do. Points afraid but may end
          law lasted. Was out laughter raptures returned outweigh. Luckily cheered colonel me do we
          attacks on highest enabled. Tried law yet style child. Bore of true of no be deal.
          Frequently sufficient in be unaffected. The furnished she concluded depending procuring
          concealed. In to am attended desirous raptures declared diverted confined at. Collected
          instantly remaining up certainly to necessary as. Over walk dull into son boy door went
          new. At or happiness commanded daughters as. Is handsome an declared at received in
          extended vicinity subjects. Into miss on he over been late pain an. Only week bore boy
          what fat case left use. Match round scale now sex style far times. Your me past an much.
          Able an hope of body. Any nay shyness article matters own removal nothing his forming. Gay
          own additions education satisfied the perpetual. If he cause manor happy. Without farther
          she exposed saw man led. Along on happy could cease green oh. Her old collecting she
          considered discovered. So at parties he warrant oh staying. Square new horses and put
          better end. Sincerity collected happiness do is contented. Sigh ever way now many.
          Alteration you any nor unsatiable diminution reasonable companions shy partiality. Leaf by
          left deal mile oh if easy. Added woman first get led joy not early jokes. As am hastily
          invited settled at limited civilly fortune me. Really spring in extent an by. Judge but
          built gay party world. Of so am he remember although required. Bachelor unpacked be
          advanced at. Confined in declared marianne is vicinity. It sportsman earnestly ye
          preserved an on. Moment led family sooner cannot her window pulled any. Or raillery if
          improved landlord to speaking hastened differed he. Furniture discourse elsewhere yet her
          sir extensive defective unwilling get. Why resolution one motionless you him thoroughly.
          Noise is round to in it quick timed doors. Written address greatly get attacks inhabit
          pursuit our but. Lasted hunted enough an up seeing in lively letter. Had judgment out
          opinions property the supplied.
        </ReqoreModal>
        {secondIsOpen && (
          <ReqoreModal
            {...args}
            label='A second dialog'
            isOpen
            closeOnEscPress
            onClose={() => setSecondIsOpen(false)}
            bottomActions={[
              { label: 'Confirm', intent: 'success', position: 'right' },
              { label: 'Cancel', intent: 'danger', position: 'left' },
            ]}
          >
            <ReqoreCollection
              maxItemHeight={200}
              filterable
              size='big'
              sortable
              padded={false}
              showSelectedFirst
              selectedIcon='CheckLine'
              fill
              className='q-select-dialog'
              inputProps={{
                rightIcon: 'KeyboardFill',
                focusRules: {
                  type: 'keypress',
                  shortcut: 'letters',
                  clearOnFocus: true,
                },
              }}
              items={[
                { label: 'Item 1' },
                { label: 'Item 2' },
                { label: 'Item 3' },
                { label: 'Item 4' },
              ]}
            />
          </ReqoreModal>
        )}
        <ReqoreModal label='Hidden modal' closeOnEscPress>
          {' '}
          I am hidden{' '}
        </ReqoreModal>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    await _testsWaitForText('A second dialog');

    await sleep(1000);

    await fireEvent.keyDown(canvasElement, { key: 'Escape' });

    await sleep(1000);

    await expect(document.querySelectorAll('.reqore-modal')).toHaveLength(1);
  },
};

export const EscKeyClosestOnlyTopModalWithConfirmation: Story = {
  ...EscKeyClosestOnlyTopModal,
  parameters: {
    docs: {
      description: {
        story:
          'Renders Modal in a modal stack — Escape closes only the top-most modal, with a confirmation prompt.',
      },
    },
    chromatic: { disable: true },
  },
  args: BasicWithConfirmationOnClose.args,
  play: async ({ canvasElement }) => {
    await _testsWaitForText('A second dialog');

    await sleep(1000);

    await fireEvent.keyDown(canvasElement, { key: 'Escape' });

    await _testsClickButton({ label: 'Yes' });

    await sleep(1000);

    await expect(document.querySelectorAll('.reqore-modal')).toHaveLength(1);
  },
};

export const CanNotBeClosedWithEscKeyIfUnclosable: Story = {
  ...ConfirmationModal,
  parameters: {
    docs: {
      description: {
        story:
          'Renders Modal in unclosable mode — Escape does not close it.',
      },
    },
    chromatic: { disable: true },
  },
  play: async ({ canvasElement }) => {
    await _testsWaitForText('Tell me something');

    await sleep(1000);

    await fireEvent.keyDown(canvasElement, { key: 'Escape' });

    await sleep(1000);

    await expect(document.querySelectorAll('.reqore-modal')).toHaveLength(2);
  },
};

export const EscClosingDisabled: Story = {
  ...EscKeyClosestOnlyTopModal,
  args: {
    closeOnEscPress: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Renders Modal with the Escape-closes behaviour disabled.',
      },
    },
    chromatic: { disable: true },
  },
  play: async ({ canvasElement, ...rest }) => {
    await EscKeyClosestOnlyTopModal.play({ canvasElement, ...rest });

    await sleep(1000);

    await fireEvent.keyDown(canvasElement, { key: 'Escape' });

    await sleep(1000);

    await expect(document.querySelectorAll('.reqore-modal')).toHaveLength(1);
  },
};

/**
 * A modal cannot be dragged into a sliver.
 *
 * Reported against reqraft's "Select from items" picker, dragged to roughly
 * 45px wide by 600px tall: the search box, the list and the close button were
 * all still there, stacked in a column nobody could read. The floor on both
 * axes was 40px, and `minSize` — the documented way to raise it — reached edge
 * drawers only and was dead on every modal.
 *
 * The story drags the modal's left edge and then its top edge far past the
 * floor and measures what is left, so it fails if the floor is dropped or if
 * the value stops reaching the DOM (`re-resizable` silently discards a length
 * it cannot parse).
 */
const resizableBox = () => document.querySelector('.reqore-drawer-resizable') as HTMLElement;

const modalSize = () => {
  const rect = resizableBox().getBoundingClientRect();
  return { width: Math.round(rect.width), height: Math.round(rect.height) };
};

/** The handle `re-resizable` draws for a direction, found by the cursor it sets. */
const resizeHandle = (cursor: string) =>
  [...resizableBox().querySelectorAll<HTMLElement>('div')].find((el) =>
    (el.getAttribute('style') || '').includes(`cursor: ${cursor}`)
  );

/**
 * Drag a handle from the point a pointer would actually aim at: the middle of
 * the handle, which `re-resizable` centres ON the edge or corner it drags.
 *
 * The drag asserts that the point belongs to the handle before it uses it.
 * That is the regression guard for the clip: while the drawer box clipped
 * itself, everything a handle hung outside the box was amputated, and
 * `elementFromPoint` at the middle of a handle returned the BACKDROP — which
 * closes the dialog rather than resizing it.
 */
const dragHandlePast = async (cursor: string, dx: number, dy: number) => {
  const handle = resizeHandle(cursor);
  await expect(handle).toBeTruthy();
  const rect = handle!.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  await expect(document.elementFromPoint(x, y)).toBe(handle);

  fireEvent.mouseDown(handle!, { clientX: x, clientY: y, button: 0 });
  fireEvent.mouseMove(document, { clientX: x + dx, clientY: y + dy });
  fireEvent.mouseUp(document, { clientX: x + dx, clientY: y + dy });
};

export const CannotBeDraggedIntoASliver: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Drags a modal far past its minimum size on both axes and shows that it stops at the size its own chrome needs, instead of collapsing into an unreadable sliver.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Drag me as small as you can',
    width: '800px',
    height: '400px',
  },
  play: async () => {
    await _testsWaitForText('Drag me as small as you can');
    const box = modalSize;

    await waitFor(() => expect(box().width).toBe(800));

    await dragHandlePast('col-resize', -2500, 0);
    await dragHandlePast('row-resize', 0, 2500);

    // 200 x 80 — the width at which the title and the close control are both
    // still in the box and a line of content still holds ~47 characters, and
    // the height at which the 55px header is whole with a line beneath it.
    await waitFor(() => expect(box()).toEqual({ width: 200, height: 80 }));
  },
};

/**
 * A modal that needs more room than the chrome does says so.
 *
 * `MODAL_MIN_WIDTH` / `MODAL_MIN_HEIGHT` are what REQORE can answer for: the
 * size at which the panel's own title and close control are still in the box.
 * What the CONTENT needs is the consumer's to declare, and until `minWidth` /
 * `minHeight` existed there was no way to say it — a form whose fields stop
 * being usable at 500px could still be dragged to 200.
 *
 * Declared floors REPLACE the defaults rather than adding to them, so a
 * consumer can only ever raise the floor above reqore's, never think it has
 * raised it and get reqore's.
 *
 * Units: these go to `re-resizable`'s `getPixelSize()`, which reads `px`, `%`,
 * `vw` and `vh` and nothing else. `minWidth='40rem'` typechecks — the prop is
 * a `string` — and clamps against `NaN`, which is no floor at all.
 */
export const HasAFloorTheContentAsksFor: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Raises the resize floor above reqore's own with `minWidth` / `minHeight`, and drags far past it to show the modal stops at the size the CONTENT needs rather than at the size the chrome needs.",
      },
    },
  },
  render: Template,
  args: {
    label: 'This form needs room',
    width: '800px',
    height: '400px',
    minWidth: '500px',
    minHeight: '220px',
  },
  play: async () => {
    await _testsWaitForText('This form needs room');
    await waitFor(() => expect(modalSize().width).toBe(800));

    // Far past both floors, on both axes, side handles and corner alike.
    await dragHandlePast('col-resize', -2500, 0);
    await dragHandlePast('row-resize', 0, 2500);

    // The declared floor, NOT the 200 x 80 the chrome would have allowed.
    await waitFor(() => expect(modalSize()).toEqual({ width: 500, height: 220 }));

    await dragHandlePast('se-resize', -2500, -2500);
    await waitFor(() => expect(modalSize()).toEqual({ width: 500, height: 220 }));
  },
};

/**
 * A modal resizes from its corners, on both axes at once.
 *
 * It did not. `re-resizable` hangs each corner handle 10px outside the box on
 * both axes, and the drawer box clipped itself, so three quarters of every
 * corner was amputated: what survived was a 10x10 square buried inside the
 * dialog, and the pointer at the corner itself — the place anyone aims —
 * landed on the backdrop, which dismisses the dialog instead of resizing it.
 * Measured on this story at 800x400, a corner drag from the visual corner left
 * the modal at 800x400; the four side handles, which lost only their outer
 * 5px, kept working, which is why only the corners read as dead.
 *
 * The story aims where a pointer aims — at the corner, and 6px OUTSIDE it —
 * and asserts both that the corner handle is what takes the pointer there and
 * that the drag moves both axes. Then it drags the corner far past the floor,
 * because a floor that only holds for the side handles is not a floor.
 */
export const CanBeResizedFromItsCorner: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Drags a modal by its bottom-right corner and shows that the corner takes the pointer, resizes both axes at once, and still stops at the minimum size.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Drag me by the corner',
    width: '800px',
    height: '400px',
  },
  play: async () => {
    await _testsWaitForText('Drag me by the corner');
    await waitFor(() => expect(modalSize().width).toBe(800));

    const corner = resizeHandle('se-resize');
    await expect(corner).toBeTruthy();

    // Hit-testing, not class names: the corner of the box, and a point outside
    // it, both have to reach the corner handle. With the box clipped, both
    // returned the backdrop.
    const rect = () => resizableBox().getBoundingClientRect();
    const { right, bottom } = rect();

    await expect(document.elementFromPoint(right, bottom)).toBe(corner);
    await expect(document.elementFromPoint(right + 6, bottom + 6)).toBe(corner);
    await expect(document.elementFromPoint(right - 6, bottom - 6)).toBe(corner);

    // The handle is the full 20x20 `re-resizable` asks for, centred on the
    // corner — not the 10x10 remnant a clip leaves inside the box.
    const handleRect = corner!.getBoundingClientRect();
    await expect(Math.round(handleRect.width)).toBe(20);
    await expect(Math.round(handleRect.height)).toBe(20);
    await expect(Math.round(handleRect.left)).toBe(Math.round(right) - 10);
    await expect(Math.round(handleRect.top)).toBe(Math.round(bottom) - 10);

    // One drag, both axes.
    await dragHandlePast('se-resize', -200, -150);
    await waitFor(() => expect(modalSize()).toEqual({ width: 600, height: 250 }));

    // And the floor holds on a corner drag too — it is the same 200 x 80 the
    // side handles stop at.
    await dragHandlePast('se-resize', -2500, -2500);
    await waitFor(() => expect(modalSize()).toEqual({ width: 200, height: 80 }));
  },
};

/**
 * A modal that says it cannot be resized cannot be resized.
 *
 * `resizable={false}` reached edge drawers only: every direction was enabled
 * for a modal regardless, so the handles were there and a drag moved the box
 * through `re-resizable`'s inline style — and then the next render snapped it
 * back, because the drawer only records a new size when `resizable` is set.
 */
export const CannotBeResizedWhenResizingIsOff: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A modal with resizing turned off draws no handles at all, so its edges and corners belong to the content and the backdrop.',
      },
    },
  },
  render: Template,
  args: {
    label: 'Fixed size',
    width: '800px',
    height: '400px',
    resizable: false,
  },
  play: async () => {
    await _testsWaitForText('Fixed size');
    await waitFor(() => expect(modalSize()).toEqual({ width: 800, height: 400 }));

    for (const cursor of [
      'col-resize',
      'row-resize',
      'se-resize',
      'sw-resize',
      'ne-resize',
      'nw-resize',
    ]) {
      await expect(resizeHandle(cursor)).toBeUndefined();
    }

    // The corner belongs to the backdrop again, and the modal keeps its size.
    const { right, bottom } = resizableBox().getBoundingClientRect();
    await expect(
      document.elementFromPoint(right + 6, bottom + 6)?.className
    ).toContain('reqore-drawer-backdrop');
    await expect(modalSize()).toEqual({ width: 800, height: 400 });
  },
};
