import { StoryFn, StoryObj } from '@storybook/react';
import { expect, waitFor } from 'storybook/test';
import { IReqoreSpanProps, ReqoreSpan } from '../../components/Span';
import { ReqoreVerticalSpacer } from '../../index';
import { StoryMeta } from '../utils';
import { IntentArg } from '../utils/args';

const meta = {
  title: 'Other/Span',
  component: ReqoreSpan,
  argTypes: {
    ...IntentArg,
  },
  args: {
    tooltip: 'This is a tooltip',
  },
} as StoryMeta<typeof ReqoreSpan>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreSpanProps> = (args) => {
  return (
    <>
      <ReqoreSpan size='tiny' {...args}>
        This is a span with some text
      </ReqoreSpan>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreSpan size='small' {...args}>
        This is a span with some text
      </ReqoreSpan>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreSpan size='normal' {...args}>
        This is a span with some text
      </ReqoreSpan>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreSpan size='big' {...args}>
        This is a span with some text
      </ReqoreSpan>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreSpan size='huge' {...args}>
        This is a span with some text
      </ReqoreSpan>
    </>
  );
};

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Span in its default configuration.',
      },
    },
  },
  render: Template,
};

export const Success: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Span with intent="success".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'success',
  },
};

export const Danger: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Span with intent="danger".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'danger',
  },
};

export const Warning: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Span with intent="warning".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'warning',
  },
};

export const Info: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Span with intent="info".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'info',
  },
};

export const Pending: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Span with intent="pending".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'pending',
  },
};

export const Muted: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Span with intent="muted".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'muted',
  },
};

export const Effect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Span with a gradient/typography effect applied.',
      },
    },
  },
  render: Template,

  args: {
    effect: {
      gradient: { colors: { 0: '#5e0acc', 100: '#c008c0' } },
      spaced: 4,
      weight: 'bold',
      uppercase: true,
      textSize: '40px',
    },
  },
};


export const MaxWidth: Story = {
  render: () => (
    <>
      {/* The bound alone: the span stops growing, but the text still spills. */}
      <ReqoreSpan maxWidth='20ch' className='bound-only'>
        svc-qorus-saas-10-svc-qorus-saas-2
      </ReqoreSpan>
      <ReqoreVerticalSpacer height={10} />
      {/* The pair: a bound plus the effect that says what happens to text which does
          not fit. This is the combination that replaces a styled wrapper. */}
      <ReqoreSpan maxWidth='20ch' effect={{ noWrap: true }} className='bound-and-nowrap'>
        svc-qorus-saas-10-svc-qorus-saas-2
      </ReqoreSpan>
      <ReqoreVerticalSpacer height={10} />
      {/* Shorter than the bound: untouched, not padded out to it. */}
      <ReqoreSpan maxWidth='20ch' effect={{ noWrap: true }} className='short'>
        short
      </ReqoreSpan>
    </>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Renders `maxWidth` on its own and paired with `effect={{ noWrap: true }}`. The bound stops the span growing; the effect supplies the `white-space` / `overflow` / `text-overflow` that turns the overflow into an ellipsis. Together they replace the styled wrapper consumers used to reach for; a span shorter than the bound keeps its natural width.',
      },
    },
  },
  play: async () => {
    const bound = await waitFor(() => {
      const el = document.querySelector('.bound-only') as HTMLElement;
      expect(el).toBeTruthy();
      return el;
    });
    const truncated = document.querySelector('.bound-and-nowrap') as HTMLElement;
    const short = document.querySelector('.short') as HTMLElement;

    // A browser resolves the `ch` to pixels, so assert the bound is respected rather
    // than the literal the caller wrote.
    const cap = parseFloat(getComputedStyle(bound).maxWidth);
    expect(Number.isFinite(cap)).toBe(true);
    expect(bound.getBoundingClientRect().width).toBeLessThanOrEqual(cap + 1);

    // Bound alone does not ellipsize — that is the effect's job, and keeping them
    // separate is what lets a caller have one without the other.
    expect(getComputedStyle(bound).textOverflow).toBe('clip');
    expect(getComputedStyle(truncated).textOverflow).toBe('ellipsis');
    expect(truncated.scrollWidth).toBeGreaterThan(truncated.clientWidth);

    // Not padded out to the cap.
    expect(short.getBoundingClientRect().width).toBeLessThan(cap);
  },
};
