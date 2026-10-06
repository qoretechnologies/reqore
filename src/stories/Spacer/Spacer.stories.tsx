import { StoryFn, StoryObj } from '@storybook/react';
import { expect, waitFor } from 'storybook/test';
import {
  IReqoreSpacerProps,
  ReqoreHorizontalSpacer,
  ReqoreSpacer,
  ReqoreVerticalSpacer,
} from '../../components/Spacer';
import { ReqoreButton, ReqoreIcon, ReqorePanel } from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Utilities/Spacer',
  component: ReqoreSpacer,
} as StoryMeta<typeof ReqoreSpacer>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreSpacerProps> = () => {
  return (
    <>
      <ReqorePanel label='Horizontal'>
        This is a horizontal spacer with <ReqoreHorizontalSpacer width={50} /> width of 50px
        <br />
        <br />
        This is a horizontal spacer with <ReqoreHorizontalSpacer
          width={10}
          lineSize='normal'
        />{' '}
        width of 10px and lineSize of normal
        <br />
        <br />
        This is a horizontal spacer with <ReqoreHorizontalSpacer width={50} height='100px' /> width
        of 50px and height of 100px
        <br />
        <br />
        This is a horizontal spacer with{' '}
        <ReqoreHorizontalSpacer width={50} height='50px' lineSize='tiny' intent='info' /> width of
        50px and height of 50px and lineSize of tiny and intent info
        <br />
        <br />
        This is a horizontal spacer with{' '}
        <ReqoreHorizontalSpacer
          width={50}
          lineSize='huge'
          intent='info'
          effect={{
            gradient: {
              colors: { 0: 'danger:lighten:2', 100: 'danger:darken:2' },
              animate: 'always',
              direction: 'to bottom',
            },
          }}
        />{' '}
        width of 30px and height of auto and lineSize of huge and an effect & animation
      </ReqorePanel>
      <ReqoreVerticalSpacer height={10} />
      <ReqorePanel label='Vertical'>
        This is a vertical spacer with <ReqoreVerticalSpacer height={50} /> height of 50px
        <br />
        <br />
        This is a vertical spacer with <ReqoreVerticalSpacer height={10} lineSize='normal' /> height
        of 10px and lineSize of normal
        <br />
        <br />
        This is a vertical spacer with <ReqoreVerticalSpacer height={50} width='100px' /> height of
        50px and width of 100px
        <br />
        <br />
        This is a vertical spacer with{' '}
        <ReqoreVerticalSpacer
          width='50px'
          height={50}
          lineSize='tiny'
          intent='info'
          align='end'
        />{' '}
        width of 50px and height of 50px and lineSize of tiny and intent info, aligned to end
        <br />
        <br />
        This is a vertical spacer with{' '}
        <ReqoreVerticalSpacer
          height={50}
          width='80%'
          lineSize='tiny'
          effect={{
            gradient: {
              colors: { 0: 'success:lighten:2', 100: 'success:darken' },
              animate: 'always',
              animationSpeed: 5,
              type: 'radial',
            },
            glow: {
              color: 'success',
              blur: 20,
            },
          }}
        />{' '}
        height of 50px and width of auto and lineSize of tiny and an effect & animation
      </ReqorePanel>
    </>
  );
};

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Spacer in its default configuration.',
      },
    },
  },
  render: Template,
};

/* ------------------------------------------------------------------------------------------------
 * Labelled spacers — the "──── OR ────" divider
 * ---------------------------------------------------------------------------------------------- */

const spacers = (canvasElement: HTMLElement) =>
  Array.from(canvasElement.querySelectorAll('.reqore-spacer-labelled')) as HTMLElement[];

const labelOf = (spacer: HTMLElement) =>
  spacer.querySelector('.reqore-spacer-label') as HTMLElement;

const linesOf = (spacer: HTMLElement) =>
  Array.from(spacer.querySelectorAll('.reqore-spacer-line')) as HTMLElement[];

const centreY = (element: Element) => {
  const { top, height } = element.getBoundingClientRect();
  return top + height / 2;
};

const centreX = (element: Element) => {
  const { left, width } = element.getBoundingClientRect();
  return left + width / 2;
};

/** A line, the label, a line — on one axis, the label centred on the line. */
const expectLabelledLine = (spacer: HTMLElement, text: string, lineVertical = false) => {
  const label = labelOf(spacer);
  const [before, after] = linesOf(spacer);

  expect(label.textContent).toBe(text);
  expect(before).toBeTruthy();
  expect(after).toBeTruthy();

  const labelBox = label.getBoundingClientRect();
  const beforeBox = before.getBoundingClientRect();
  const afterBox = after.getBoundingClientRect();

  if (lineVertical) {
    expect(beforeBox.bottom).toBeLessThanOrEqual(labelBox.top);
    expect(afterBox.top).toBeGreaterThanOrEqual(labelBox.bottom);
    expect(Math.abs(centreX(label) - centreX(before))).toBeLessThanOrEqual(1);
  } else {
    expect(beforeBox.right).toBeLessThanOrEqual(labelBox.left);
    expect(afterBox.left).toBeGreaterThanOrEqual(labelBox.right);
    expect(Math.abs(centreY(label) - centreY(before))).toBeLessThanOrEqual(1);
  }
};

const LoginCard = ({ children }: { children?: React.ReactNode }) => (
  <ReqorePanel label='Sign in' style={{ maxWidth: 420 }} contentStyle={{ display: 'block' }}>
    <ReqoreButton fluid intent='info'>
      Sign in
    </ReqoreButton>
    {children}
    <ReqoreButton fluid icon='GoogleFill'>
      Google
    </ReqoreButton>
  </ReqorePanel>
);

export const Label: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the "or sign in with" divider between two buttons: a thin line, a small uppercase muted label in the middle and the line continuing, inside the 24px the spacer always took.',
      },
    },
  },
  render: () => (
    <LoginCard>
      <ReqoreVerticalSpacer height={24} lineSize='tiny' label='or sign in with' />
    </LoginCard>
  ),
  play: async ({ canvasElement }) => {
    const [spacer] = spacers(canvasElement);

    expectLabelledLine(spacer, 'or sign in with');
    expect(spacer.getBoundingClientRect().height).toBeCloseTo(24, 0);
    expect(getComputedStyle(labelOf(spacer)).textTransform).toBe('uppercase');
    expect(spacer.getAttribute('role')).toBe('separator');
    expect(spacer.getAttribute('aria-label')).toBe('or sign in with');
  },
};

const AlignMatrix = () => (
  <ReqorePanel label='labelAlign' style={{ maxWidth: 520 }} contentStyle={{ display: 'block' }}>
    <ReqoreVerticalSpacer height={32} lineSize='tiny' label='start' labelAlign='start' />
    <ReqoreVerticalSpacer height={32} lineSize='tiny' label='center' />
    <ReqoreVerticalSpacer height={32} lineSize='tiny' label='end' labelAlign='end' />
    <ReqoreVerticalSpacer height={32} lineSize='none' label='no line' />
  </ReqorePanel>
);

const expectAlignMatrix = (canvasElement: HTMLElement) => {
  const [start, center, end, noLine] = spacers(canvasElement);

  expectLabelledLine(start, 'start');
  expectLabelledLine(center, 'center');
  expectLabelledLine(end, 'end');

  // start / end leave a short line (twice the 12px gap) before / after the label.
  expect(linesOf(start)[0].getBoundingClientRect().width).toBeCloseTo(24, 0);
  expect(linesOf(end)[1].getBoundingClientRect().width).toBeCloseTo(24, 0);
  // center splits what is left evenly.
  const [left, right] = linesOf(center).map((line) => line.getBoundingClientRect().width);
  expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
  // With no line the label still renders, centred.
  expect(labelOf(noLine).textContent).toBe('no line');
};

export const LabelAlign: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a labelled line with `labelAlign` start, center (the default) and end, and one with `lineSize="none"`: start and end leave a short line before or after the label, center splits the line evenly, and with no line only the label shows.',
      },
    },
  },
  render: AlignMatrix,
  play: async ({ canvasElement }) => expectAlignMatrix(canvasElement),
};

export const LabelLight: Story = {
  args: { mainTheme: '#f4f4f4' } as Story['args'],
  parameters: {
    docs: {
      description: {
        story:
          'Renders the sign-in divider and the `labelAlign` matrix on a light theme: the line is a light grey and the label a darker muted grey that still reads on the light surface.',
      },
    },
  },
  render: () => (
    <>
      <LoginCard>
        <ReqoreVerticalSpacer height={24} lineSize='tiny' label='or sign in with' />
      </LoginCard>
      <ReqoreVerticalSpacer height={20} />
      <AlignMatrix />
    </>
  ),
  play: async ({ canvasElement }) => {
    const [divider] = spacers(canvasElement);

    expectLabelledLine(divider, 'or sign in with');
    // Dark text on the light theme, but not full black: muted.
    const [r, g, b] = getComputedStyle(labelOf(divider)).color.match(/\d+/g).map(Number);
    expect(r).toBeLessThan(140);
    expect(r).toBeGreaterThan(40);
    expect(g).toBe(r);
    expect(b).toBe(r);
  },
};

export const LabelVerticalLine: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders `ReqoreHorizontalSpacer` with a label: a vertical line broken by horizontal text, once at a fixed 120px height between two panels and once at 100% of a 200px flex row, with the label centred on the line.',
      },
    },
  },
  render: () => (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ReqorePanel label='Email' style={{ width: 200 }}>
          Sign in with your email address.
        </ReqorePanel>
        <ReqoreHorizontalSpacer width={30} height='120px' lineSize='tiny' label='or' />
        <ReqorePanel label='Single sign-on' style={{ width: 200 }}>
          Use your company account.
        </ReqorePanel>
      </div>
      <ReqoreVerticalSpacer height={20} />
      <div className='story-full-height' style={{ display: 'flex', height: 200 }}>
        <ReqorePanel label='Left' style={{ width: 200 }} />
        <ReqoreHorizontalSpacer width={30} height='100%' lineSize='small' label='vs' />
        <ReqorePanel label='Right' style={{ width: 200 }} />
      </div>
    </>
  ),
  play: async ({ canvasElement }) => {
    const [fixed, full] = spacers(canvasElement);

    expectLabelledLine(fixed, 'or', true);
    expectLabelledLine(full, 'vs', true);
    expect(fixed.getAttribute('aria-orientation')).toBe('vertical');

    const run = (spacer: HTMLElement) =>
      spacer.querySelector('.reqore-spacer-labelled-line').getBoundingClientRect().height;
    expect(run(fixed)).toBeCloseTo(120, 0);
    expect(run(full)).toBeCloseTo(200, 0);
  },
};

export const LabelEffect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders labelled lines with their own looks: an info intent line with a label in bold info-coloured lowercase text, a gradient line with a larger label, `size` big, and a label that is a node (an icon and text).',
      },
    },
  },
  render: () => (
    <ReqorePanel label='labelEffect' style={{ maxWidth: 520 }} contentStyle={{ display: 'block' }}>
      <ReqoreVerticalSpacer
        height={32}
        lineSize='small'
        intent='info'
        label='Today'
        labelEffect={{ uppercase: false, color: 'info:lighten', weight: 'bold', spaced: 0 }}
      />
      <ReqoreVerticalSpacer
        height={40}
        lineSize='normal'
        label='Section two'
        labelEffect={{ textSize: '16px' }}
        effect={{
          gradient: {
            colors: { 0: 'success:lighten:2', 100: 'success:darken:2' },
            direction: 'to right',
          },
        }}
      />
      <ReqoreVerticalSpacer height={44} lineSize='tiny' label='Big' size='big' />
      <ReqoreVerticalSpacer
        height={32}
        lineSize='tiny'
        aria-label='new messages'
        label={
          <>
            <ReqoreIcon icon='MailLine' size='12px' margin='right' />
            New messages
          </>
        }
      />
    </ReqorePanel>
  ),
  play: async ({ canvasElement }) => {
    const [intentLine, gradient, big, node] = spacers(canvasElement);

    expectLabelledLine(intentLine, 'Today');
    expect(getComputedStyle(labelOf(intentLine)).textTransform).toBe('none');
    expectLabelledLine(gradient, 'Section two');
    expect(getComputedStyle(labelOf(gradient)).fontSize).toBe('16px');
    expectLabelledLine(big, 'Big');
    expect(getComputedStyle(labelOf(big)).fontSize).toBe('18px');
    expect(labelOf(node).querySelector('.reqore-icon')).toBeTruthy();
    expect(node.getAttribute('aria-label')).toBe('new messages');
  },
};

export const LabelNarrow: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    qlip: { viewport: { width: 380, height: 700 } },
    docs: {
      description: {
        story:
          'Renders labelled lines on a phone-width screen (380px) and in a 160px box: the line fills the width, and a label too long for its line stays on one line and ends in an ellipsis, keeping a short line on each side.',
      },
    },
  },
  render: () => (
    <>
      <LoginCard>
        <ReqoreVerticalSpacer height={24} lineSize='tiny' label='or sign in with' />
      </LoginCard>
      <ReqoreVerticalSpacer height={20} />
      <div style={{ width: 160 }}>
        <ReqoreVerticalSpacer
          height={24}
          lineSize='tiny'
          label='or continue with your company account'
        />
      </div>
    </>
  ),
  play: async ({ canvasElement }) => {
    const [divider, narrow] = spacers(canvasElement);

    expectLabelledLine(divider, 'or sign in with');
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1);

    const label = labelOf(narrow);
    await waitFor(() => expect(label.scrollWidth).toBeGreaterThan(label.clientWidth));
    expect(getComputedStyle(label).textOverflow).toBe('ellipsis');
    linesOf(narrow).forEach((line) =>
      expect(line.getBoundingClientRect().width).toBeGreaterThanOrEqual(23.5)
    );
    expect(narrow.getBoundingClientRect().width).toBeLessThanOrEqual(160.5);
  },
};
