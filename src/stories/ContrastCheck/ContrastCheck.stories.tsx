import { StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';
import { ReqoreP } from '../../components/Paragraph';
import { StoryMeta } from '../utils';
import { lowContrastTextIn } from '../utils/contrastGate';

/* The story run's contrast check (`src/stories/utils/contrastGate.ts`, run after every story): what it leaves alone
   and what it measures where axe-core cannot decide. */

const meta = {
  title: 'Other/Contrast Check',
  component: ReqoreP,
} as StoryMeta<typeof ReqoreP>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DecorationIsLeftAlone: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a line of text that reads on the page, over a backdrop of faint words marked as decoration (`data-decorative`). The story run\'s contrast check leaves the backdrop\'s words alone, as WCAG does, and the story passes.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div data-decorative style={{ background: 'rgb(32, 32, 32)', color: 'rgb(44, 44, 44)', padding: 16 }}>
        Busy backdrop words behind a frosted surface
      </div>
      <ReqoreP>Text that reads on the page.</ReqoreP>
    </div>
  ),
};

export const UndecidedTextIsMeasured: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a line of text that reads on the page. The check is given a faint single character, too short for axe-core to decide whether it is text: it measures it against what it is drawn on and finds it.',
      },
    },
  },
  render: () => <ReqoreP>Text that reads on the page.</ReqoreP>,
  play: async () => {
    // drawn only while it is checked: the story run's own check, after the story, would find it too
    const faint = document.createElement('div');
    faint.setAttribute('style', 'background: rgb(32, 32, 32); color: rgb(50, 50, 50); padding: 16px');
    // one character: axe cannot tell it from an icon font, and leaves it undecided
    faint.textContent = '7';
    document.body.appendChild(faint);
    try {
      const found = await lowContrastTextIn(faint);
      await expect(found).toHaveLength(1);
      await expect(found[0]).toContain('text "7"');
    } finally {
      faint.remove();
    }
  },
};
