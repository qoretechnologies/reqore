import { StoryFn, StoryObj } from '@storybook/react';
import { expect, waitFor } from 'storybook/test';
import { noop } from 'lodash';
import { IReqoreTagProps } from '../../components/Tag';
import { IReqoreTagGroup } from '../../components/Tag/group';
import { ReqoreTag, ReqoreTagGroup, ReqoreVerticalSpacer } from '../../index';
import { StoryMeta } from '../utils';
import { ALL_SIZES, RadiusSizeArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreTagGroup & IReqoreTagProps>();

const meta = {
  title: 'Form/Tag',
  component: ReqoreTag,
  args: {
    onClick: noop,
    onRemoveClick: noop,
    rightIcon: 'EBike2Line',
    actions: [
      {
        icon: '24HoursFill',
        onClick: noop,
        disabled: true,
        intent: 'info',
        tooltip: { content: 'I am a tooltip' },
      },
      {
        icon: 'SpyFill',
        onClick: noop,
        intent: 'success',
      },
    ],
  },
  argTypes: {
    ...SizeArg,
    ...RadiusSizeArg,
    ...createArg('columns', {
      name: 'Columns',
      description: 'Number of columns',
      control: 'number',
    }),
    ...createArg('onClick', {
      defaultValue: noop,
      table: {
        disable: true,
      },
    }),
    ...createArg('onRemoveClick', {
      defaultValue: noop,
      table: {
        disable: true,
      },
    }),
    ...createArg('rightIcon', {
      defaultValue: 'EBike2Line',
      name: 'Right Icon',
      description: 'Right icon',
      control: 'text',
    }),
    ...createArg('actions', {
      table: {
        disable: true,
      },
    }),
    ...createArg('appearance', {
      defaultValue: 'solid',
      name: 'Appearance',
      description:
        "How much of the tag the colour paints: `solid` fills it (default), `soft` draws a ring and the label over a 20% wash of the colour, `text` colours only the label and icons.",
      options: ['solid', 'soft', 'text'],
      control: 'select',
    }),
    ...createArg('readOnly', {
      defaultValue: false,
      name: 'Read only',
      description:
        'Marks the tag as something that cannot be acted on right now, WITHOUT taking its pointer events away — so its tooltip and its actions still answer and can say why. It does NOT withhold `onClick`: a read-only `ReqoreTag`, `ReqoreButton` or `ReqoreCheckbox` still fires the handler it was given, which is why the ReadOnly story below renders one with an `onClick`. Refusing the CHANGE belongs to whatever owns the choice — `ReqoreDropdown` / `ReqoreSelect` items, `ReqoreRadioGroup` items, `ReqoreRating` and `ReqoreSegmentedControl` all decline a read-only selection — so on a tag, withhold the handler yourself. Unlike `disabled`, which dims the tag and removes it from interaction entirely, taking any explanation with it.',
      control: 'boolean',
    }),
  },
} as StoryMeta<typeof ReqoreTag>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreTagProps> = (args) => {
  return (
    <>
      <ReqoreTagGroup>
        <ReqoreTag {...args} actions={null} onRemoveClick={null} rightIcon={null} label={1} />
        <ReqoreTag
          {...args}
          actions={null}
          onRemoveClick={null}
          rightIcon={null}
          label='Basic Tag'
          onClick={() => console.log('Tag clicked')}
        />
        <ReqoreTag
          {...args}
          actions={null}
          onRemoveClick={null}
          rightIcon={null}
          label={null}
          icon='Asterisk'
          onClick={() => console.log('Tag clicked')}
        />
        <ReqoreTag
          {...args}
          onRemoveClick={null}
          rightIcon={null}
          label={null}
          icon='UsbLine'
          onClick={() => console.log('Tag clicked')}
        />
        <ReqoreTag
          {...args}
          actions={null}
          onRemoveClick={null}
          rightIcon={null}
          labelKey='Number'
          label={2}
        />
        <ReqoreTag label='With Icon' icon='AlarmWarningLine' {...args} />
        <ReqoreTag
          {...args}
          labelKey='Without label'
          icon='AlarmWarningLine'
          rightIcon='24HoursFill'
        />
        <ReqoreTag
          label='With Icon Colors'
          icon='AlarmWarningLine'
          {...args}
          iconColor='warning:lighten:2'
        />
        <ReqoreTag labelKey='Tag with' label='Label Key' icon='AlarmWarningLine' {...args} />
        <ReqoreTag
          labelKey='Compact Tag with'
          label='Label Key'
          icon='AlarmWarningLine'
          compact
          {...args}
        />
        <ReqoreTag labelKey='Key' label='value' {...args} />
        <ReqoreTag icon='QuestionAnswerLine' {...args} fixed />
        <ReqoreTag label='Non Flat Tag' icon='BaiduLine' flat={false} {...args} />
        <ReqoreTag label='Disabled Tag' disabled icon='AlarmWarningLine' {...args} />
        <ReqoreTag
          label='300px Tag'
          width='300px'
          fixed
          icon='AlarmWarningLine'
          {...args}
          tooltip='I am wiiiiiiide'
          actions={[
            {
              icon: 'ErrorWarningLine',
              onClick: noop,
              intent: 'info',
              tooltip: {
                content: 'IF YOU CAN SEE ME ITS A BUG!!! I HAVE show: false',
                openOnMount: true,
                intent: 'danger',
              },
              show: false,
            },
            {
              icon: '24HoursFill',
              onClick: noop,
              disabled: true,
              intent: 'info',
              tooltip: { content: 'I am a tooltip' },
            },
            {
              icon: 'SpyFill',
              onClick: noop,
              intent: 'success',
            },
          ]}
        />
        <ReqoreTag
          label='300px fixed Tag with a big description that should wrap and make the tag bigger'
          width='300px'
          fixed
          icon='AlarmWarningLine'
          {...args}
          tooltip='I am wiiiiiiide'
          actions={[
            {
              icon: 'ErrorWarningLine',
              onClick: noop,
              intent: 'info',
              tooltip: {
                content: 'IF YOU CAN SEE ME ITS A BUG!!! I HAVE show: false',
                openOnMount: true,
                intent: 'danger',
              },
              show: false,
            },
            {
              icon: '24HoursFill',
              onClick: noop,
              disabled: true,
              intent: 'info',
              tooltip: { content: 'I am a tooltip' },
            },
            {
              icon: 'SpyFill',
              onClick: noop,
              intent: 'success',
            },
          ]}
        />
        <ReqoreTag label='Danger Tag' icon='AlarmWarningLine' intent='danger' {...args} />
        <ReqoreTag label='Transparent tag' icon='Ghost2Line' {...args} color='transparent' />
        <ReqoreTag
          label='Custom Color Tag'
          icon='AlarmWarningLine'
          color='#38fdb2'
          {...args}
          tooltip={{ content: 'Hm, another tooltip', openOnMount: true }}
        />
        <ReqoreTag
          label='Custom Effect Tag'
          effect={{
            gradient: {
              colors: '#ff47a3',
            },
          }}
          labelKeyEffect={{
            gradient: {
              colors: '#b8f58a',
            },
            weight: 'thin',
            spaced: 2,
            uppercase: true,
          }}
          labelEffect={{
            gradient: {
              colors: {
                0: '#00e3e8',
                100: '#143a40',
              },
            },
            weight: 'bold',
          }}
          labelKey='Effect'
          icon='Css3Fill'
          {...args}
        />
        <ReqoreTag
          {...args}
          label='No Buttons Tag'
          icon='CarLine'
          color='#0b4578'
          rightIcon={args.rightIcon}
          actions={null}
          onRemoveClick={null}
        />
        <ReqoreTag
          {...args}
          label='Minimal Tag'
          minimal
          icon='ShareForward2Fill'
          rightIcon={args.rightIcon}
          actions={null}
          onRemoveClick={null}
        />
        <ReqoreTag
          {...args}
          label='Minimal Tag with Intent'
          minimal
          intent='warning'
          icon='ShareForward2Fill'
          rightIcon={args.rightIcon}
          actions={null}
          onRemoveClick={null}
        />
        <ReqoreTag
          {...args}
          labelKey='Minimal Tag '
          label='with Intent and Key'
          minimal
          intent='success'
          icon='CodeView'
          rightIcon={args.rightIcon}
          actions={null}
          onRemoveClick={null}
        />
        <ReqoreTag
          {...args}
          labelKey='This is the key for a wrapped tag'
          label='Wrapped tag with some long text and width specified, no wrap specified'
          icon='ShareForward2Fill'
          rightIcon={args.rightIcon}
          width='400px'
          onRemoveClick={null}
          actions={[
            {
              icon: '24HoursFill',
              onClick: noop,
              disabled: true,
              intent: 'info',
              tooltip: { content: 'I am a tooltip' },
            },
            {
              icon: 'SpyFill',
              onClick: noop,
              intent: 'success',
              tooltip: { content: 'Hm, another tooltip', openOnMount: true },
            },
          ]}
        />
        <ReqoreTag
          {...args}
          labelKey='This is the key for a wrapped tag'
          label='Wrapped tag with some long text and NO width specified, AND wrap specified'
          icon='ShareForward2Fill'
          rightIcon={args.rightIcon}
          leftIconColor='#00fafd'
          rightIconColor='#eb0e8c'
          wrap
          onRemoveClick={null}
          actions={[
            {
              icon: '24HoursFill',
              onClick: noop,
              disabled: true,
              intent: 'info',
              tooltip: { content: 'I am a tooltip' },
            },
            {
              icon: 'SpyFill',
              onClick: noop,
              intent: 'success',
              tooltip: { content: 'Hm, another tooltip', openOnMount: true },
            },
          ]}
        />
        <ReqoreTag
          {...args}
          labelKey='Fixed'
          fixed='key'
          label='Wrapped tag with some long text and NO width specified, AND wrap specified, with fixed key'
          icon='DriveLine'
          rightIcon={args.rightIcon}
          wrap
          onRemoveClick={null}
          actions={[
            {
              icon: '24HoursFill',
              onClick: noop,
              disabled: true,
              intent: 'info',
              tooltip: { content: 'I am a tooltip' },
            },
            {
              icon: 'SpyFill',
              onClick: noop,
              intent: 'success',
              tooltip: { content: 'Hm, another tooltip', openOnMount: true },
            },
          ]}
        />
        <ReqoreTag
          {...args}
          labelKey='Wrapped tag with some long text and NO width specified, AND wrap specified, with fixed label, Wrapped tag with some long text and NO width specified, AND wrap specified, with fixed label'
          fixed='label'
          label='Fixed'
          icon='DriveLine'
          rightIcon={args.rightIcon}
          wrap
          onRemoveClick={null}
          actions={[
            {
              icon: '24HoursFill',
              onClick: noop,
              disabled: true,
              intent: 'info',
              tooltip: { content: 'I am a tooltip' },
            },
            {
              icon: 'SpyFill',
              onClick: noop,
              intent: 'success',
              tooltip: { content: 'Hm, another tooltip', openOnMount: true },
            },
          ]}
        />
      </ReqoreTagGroup>
      <ReqoreVerticalSpacer height={5} />
      <ReqoreTagGroup>
        <ReqoreTag label='Center aligned' align='center' {...args} />
      </ReqoreTagGroup>
      <ReqoreVerticalSpacer height={5} />
      <ReqoreTagGroup>
        <ReqoreTag label='Right aligned' align='right' {...args} />
      </ReqoreTagGroup>
      <ReqoreTagGroup>
        <ReqoreTag
          label='With hidden action'
          {...args}
          actions={[...args.actions, { icon: 'VolumeDownLine', show: 'hover' }]}
        />
      </ReqoreTagGroup>
    </>
  );
};

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag in its default configuration.',
      },
    },
  },
  render: Template,
};

export const Badge: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag with a badge attached.',
      },
    },
  },
  render: Template,
  args: { asBadge: true },
};

export const Wrap: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag with content wrapping enabled.',
      },
    },
  },
  render: Template,
  args: { wrap: true },
};

export const Minimal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag in its minimal variant.',
      },
    },
  },
  render: Template,
  args: { minimal: true },
};

export const NotFlat: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag with flat={false} so the elevated look is applied.',
      },
    },
  },
  render: Template,
  args: { flat: false },
};

export const WithTextAligns: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag with different text alignments across the items.',
      },
    },
  },
  render: Template,
  args: { labelAlign: 'right', labelKeyAlign: 'center' },
};

export const Effect = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag with a gradient/typography effect applied.',
      },
    },
  },
  render: Template,

  args: {
    effect: {
      gradient: {
        direction: 'to right bottom',
        colors: { 0: '#33023c', 100: '#0a487b' },
      },
      color: '#ffffff',
      spaced: 2,
      uppercase: true,
      weight: 'thick',
      textSize: 'small',
    },
  },
};

export const Raised: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag with the shared raised treatment — the same inset highlight and ' +
          'shadow Panel, Button, Callout and EntityRow use, so a raised tag sits in the ' +
          'same material as the raised surfaces around it. Suppressed when the tag is ' +
          'not flat, because the border already draws that edge.',
      },
    },
  },
  render: Template,
  args: { raised: true },
};

export const MonospaceFontFamily: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders Tag with effect.fontFamily set to the 'mono' shorthand. A tag showing " +
          'a literal value — an id, a data path, an error code — reads better in ' +
          'monospace, and until now the tag hardcoded system-ui, so consumers had to ' +
          'override it with a descendant selector. The effect wins instead.',
      },
    },
  },
  render: Template,
  args: { effect: { fontFamily: 'mono' } },
};

export const InlineInProse: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A tag sized to sit inside a sentence: `paddingSize` takes the vertical ' +
          'padding below the 4px the tag used to hardcode, and `verticalAlign=\'baseline\'` ' +
          'puts its label on the text baseline instead of centring the box on the ' +
          "line's midline. Note that `size` alone cannot do this — with `wrap` set the " +
          'tag uses `min-height`, so the box grows to its label and every size renders ' +
          'the same height.',
      },
    },
  },
  render: Template,
  args: { size: 'small', paddingSize: 'micro', verticalAlign: 'baseline', wrap: true },
};

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag in its loading state.',
      },
    },
  },
  render: Template,
  args: { loading: true },
};

export const RadiusSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag at every radius size to show the border-radius scale.',
      },
    },
  },
  render: () => (
    <ReqoreTagGroup>
      {ALL_SIZES.map((rs) => (
        <ReqoreTag key={rs} size='normal' radiusSize={rs} label={`radiusSize="${rs}"`} />
      ))}
    </ReqoreTagGroup>
  ),
};


/**
 * Same guard as ReqorePanel: a tag action declared `show: 'hover'` is hidden
 * only where the pointer can hover. On touch it stays visible, because
 * `display: none` there would leave no route to the action at all.
 */
export const HoverActionReachableWithoutHover: Story = {
  args: {
    label: 'Tag with a hover action',
    actions: [{ icon: 'DeleteBinLine', show: 'hover', className: 'hover-gated-tag-action' }],
  },
  parameters: {
    // No snapshot — same reasoning as the ReqorePanel story: the action is
    // hidden at rest on a hovering pointer, so the capture shows a bare tag and
    // reviews as empty. The play test still runs in CI and is the real coverage.
    // (Requested by Foxhoundn on qlip build #174.)
    qlip: { skip: true },
    docs: {
      description: {
        story:
          "Renders a tag whose delete action is declared `show: 'hover'`. Hidden at rest on a hovering pointer; the hover-hiding rule sits inside a `(hover: hover) and (pointer: fine)` query so touch devices render it visible instead of unreachable.",
      },
    },
  },
  play: async () => {
    const action = await waitFor(() => {
      const el = document.querySelector('.hover-gated-tag-action') as HTMLElement;
      expect(el).toBeTruthy();
      return el;
    });

    // Desktop still hides it at rest — catches an inverted or mistyped query.
    expect(getComputedStyle(action).display).toBe('none');

    const gated = Array.from(document.styleSheets).some((sheet) => {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        return false;
      }
      return Array.from(rules).some(
        (rule) =>
          rule instanceof CSSMediaRule &&
          rule.conditionText.includes('hover') &&
          rule.cssText.includes('reqore-tag-action-hidden')
      );
    });
    expect(gated).toBe(true);
  },
};

export const MaxWidth: Story = {
  render: () => (
    <ReqoreTagGroup>
      <ReqoreTag
        label='https://qorus.example.com:8011/webhooks/paddle-notifications'
        maxWidth='30ch'
        tooltip='https://qorus.example.com:8011/webhooks/paddle-notifications'
      />
      <ReqoreTag labelKey='POST' label='/orders/{id}/fulfilments' maxWidth='24ch' />
      <ReqoreTag
        icon='LinkM'
        label='https://qorus.example.com:8011/api/latest/services'
        rightIcon='ExternalLinkLine'
        maxWidth='28ch'
      />
      <ReqoreTag label='short' maxWidth='30ch' />
      <ReqoreTag label='https://qorus.example.com:8011/very/long/wrapped' maxWidth='24ch' wrap />
    </ReqoreTagGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Renders tags capped with `maxWidth`. A label longer than the cap truncates with an ellipsis while the icons, the label key and the right icon keep their full size; a short label keeps its natural width rather than being padded out to the cap the way `width` would; and a `wrap` tag ignores the cap, because wrapping asks for more lines rather than fewer characters.',
      },
    },
  },
  play: async () => {
    const tags = await waitFor(() => {
      const found = document.querySelectorAll('.reqore-tag');
      expect(found.length).toBe(5);
      return Array.from(found) as HTMLElement[];
    });

    // The cap is honoured, and it beats the implicit max-width: 100%. A browser
    // resolves the `ch` to pixels, so the assertion is that a bound exists and the
    // tag respects it — not the literal the caller wrote.
    const cap = parseFloat(getComputedStyle(tags[0]).maxWidth);
    expect(Number.isFinite(cap)).toBe(true);
    expect(tags[0].getBoundingClientRect().width).toBeLessThanOrEqual(cap + 1);

    // The label overflows its own box and therefore ellipsizes, rather than the tag
    // clipping a centred label at both ends — which is what a bare max-width did.
    const label = tags[0].querySelector('.reqore-tag-label') as HTMLElement;
    expect(getComputedStyle(label).textOverflow).toBe('ellipsis');
    expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);

    // The key half stays whole: a truncated "POST" would say nothing.
    const key = tags[1].querySelector('.reqore-tag-key-content') as HTMLElement;
    expect(key.textContent).toBe('POST');
    expect(key.scrollWidth).toBe(key.clientWidth);

    // A short label is not padded out to the cap — that is what `width` is for.
    expect(tags[3].getBoundingClientRect().width).toBeLessThan(
      tags[0].getBoundingClientRect().width
    );

    // `wrap` wins: no label box, so nothing truncates.
    expect(tags[4].querySelector('.reqore-tag-label')).toBeNull();
  },
};


export const MaxWidthTruncateMiddle: Story = {
  render: () => (
    <ReqoreTagGroup>
      {/* Same host, different webhook — the tail is the only thing telling them
          apart, so dropping it would render both identically. */}
      <ReqoreTag
        label='https://qorus.example.com:8011/webhooks/paddle-notifications'
        maxWidth='34ch'
        truncate='middle'
      />
      <ReqoreTag
        label='https://qorus.example.com:8011/webhooks/stripe-notifications'
        maxWidth='34ch'
        truncate='middle'
      />
      {/* The same two with the default end truncation, for contrast: both read the
          same, which is what this option exists to avoid. */}
      <ReqoreTag
        label='https://qorus.example.com:8011/webhooks/paddle-notifications'
        maxWidth='34ch'
      />
      <ReqoreTag
        label='https://qorus.example.com:8011/webhooks/stripe-notifications'
        maxWidth='34ch'
      />
      {/* With a label key beside it — the key is fixed, so the label gets whatever is
          left, which is the case a consumer hits first. */}
      <ReqoreTag
        labelKey='POST'
        label='https://qorus.example.com:8011/webhooks/paddle-notifications'
        maxWidth='34ch'
        truncate='middle'
      />
    </ReqoreTagGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Renders `truncate='middle'` beside the default. The first two tags share a host and differ only at the end, so keeping both ends tells them apart; the second two are the same values with the tail dropped, and read identically. Both are pure CSS — the whole label stays in the DOM either way, so the value is still selectable, copyable and read out in full by a screen reader.",
      },
    },
  },
  play: async () => {
    const tags = await waitFor(() => {
      const found = document.querySelectorAll('.reqore-tag');
      expect(found.length).toBe(5);
      return Array.from(found) as HTMLElement[];
    });

    const parts = (tag: HTMLElement) => [
      tag.querySelector('.reqore-tag-label-head') as HTMLElement,
      tag.querySelector('.reqore-tag-label-tail') as HTMLElement,
    ];

    const [paddleHead, paddleTail] = parts(tags[0]);
    const [, stripeTail] = parts(tags[1]);

    // Nothing is thrown away: the DOM still holds the whole value.
    expect(`${paddleHead.textContent}${paddleTail.textContent}`).toBe(
      'https://qorus.example.com:8011/webhooks/paddle-notifications'
    );

    // The head is what actually shortens...
    expect(paddleHead.scrollWidth).toBeGreaterThan(paddleHead.clientWidth);
    // ...and the pinned tail is fully visible, which is the whole point.
    expect(paddleTail.scrollWidth).toBe(paddleTail.clientWidth);

    // The two are distinguishable on screen, which they would not be end-truncated.
    expect(paddleTail.textContent).not.toBe(stripeTail.textContent);
    expect(stripeTail.textContent).toContain('notifications');

    // The default keeps the single label box and no pinned tail.
    expect(tags[2].querySelector('.reqore-tag-label')).toBeTruthy();
    expect(tags[2].querySelector('.reqore-tag-label-tail')).toBeNull();
  },
};

export const ReadOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The three states a tag can be in, side by side. `disabled` is `pointer-events: none` — the tag dims and nothing on it can be hovered or pressed, so a tooltip explaining WHY is unreachable. `readOnly` only marks the tag `cursor: not-allowed`: it keeps full opacity and its pointer events, so its tooltip and its actions still answer. It does not withhold the `onClick` the middle tag here is given — the tag says the press will not help, it does not refuse it — so a caller who needs the press refused withholds the handler. Reach for `readOnly` whenever the user has to be able to find out why something is unavailable.",
      },
    },
  },
  render: () => (
    <ReqoreTagGroup>
      <ReqoreTag label='Available' icon='CheckLine' intent='success' onClick={noop} />
      <ReqoreTag
        label='Needs the Enterprise licence'
        icon='LockLine'
        readOnly
        onClick={noop}
        tooltip={{ content: 'Available on the Enterprise plan' }}
      />
      <ReqoreTag label='Turned off' icon='ForbidLine' disabled onClick={noop} />
    </ReqoreTagGroup>
  ),
  play: async () => {
    const tags = await waitFor(() => {
      const found = document.querySelectorAll('.reqore-tag');
      expect(found.length).toBe(3);
      return Array.from(found) as HTMLElement[];
    });

    const [available, readOnly, disabled] = tags.map((tag) => getComputedStyle(tag));

    expect(available.cursor).toBe('pointer');

    // The read-only tag is still fully there to be hovered and read.
    expect(readOnly.cursor).toBe('not-allowed');
    expect(readOnly.pointerEvents).toBe('auto');
    expect(readOnly.opacity).toBe('1');

    // The disabled one is not, which is why it cannot carry a reason.
    expect(disabled.pointerEvents).toBe('none');
    expect(disabled.opacity).toBe('0.5');
  },
};

/* ---------------------------------------------------------------------------------
 * appearance: 'soft' | 'text'
 * ------------------------------------------------------------------------------- */

const APPEARANCE_INTENTS: IReqoreTagProps['intent'][] = [
  'info',
  'success',
  'pending',
  'warning',
  'danger',
  'muted',
];

const APPEARANCE_INTENT_ICONS: Record<string, IReqoreTagProps['icon']> = {
  info: 'InformationLine',
  success: 'CheckboxCircleLine',
  pending: 'TimerLine',
  warning: 'AlertLine',
  danger: 'ErrorWarningLine',
  muted: 'ForbidLine',
};

/**
 * One row per intent (then a custom `color`, an `effect.color` and no colour at all),
 * each with the same four tags: icon + label, a key/value tag, a removable tag with a
 * right icon, and a clickable pill. Then every size, and the three appearances side by
 * side so the soft and text looks can be compared with the solid one they replace.
 */
const AppearanceMatrix = ({ appearance }: { appearance: IReqoreTagProps['appearance'] }) => {
  const rows: { name: string; props: Partial<IReqoreTagProps>; icon: IReqoreTagProps['icon'] }[] =
    [
      ...APPEARANCE_INTENTS.map((intent) => ({
        name: intent,
        props: { intent },
        icon: APPEARANCE_INTENT_ICONS[intent],
      })),
      { name: 'color', props: { color: '#8e44ad' }, icon: 'PaletteLine' },
      { name: 'effect.color', props: { effect: { color: '#1abc9c' } }, icon: 'DropLine' },
      { name: 'no colour', props: {}, icon: 'PriceTag3Line' },
    ];

  return (
    <div className='appearance-matrix'>
      {rows.map(({ name, props, icon }) => (
        <ReqoreTagGroup
          key={name}
          appearance={appearance}
          className={`appearance-row appearance-row-${name.replace(/[^a-z]/g, '-')}`}
          style={{ marginBottom: 8 }}
        >
          <ReqoreTag {...props} icon={icon} label={name} />
          <ReqoreTag {...props} labelKey='status' label={name} />
          <ReqoreTag
            {...props}
            label='Removable'
            rightIcon='ArrowRightSLine'
            onRemoveClick={noop}
          />
          <ReqoreTag {...props} icon={icon} label='Pill' radiusSize='huge' onClick={noop} />
        </ReqoreTagGroup>
      ))}
      <ReqoreVerticalSpacer height={10} />
      <ReqoreTagGroup appearance={appearance} className='appearance-sizes'>
        {ALL_SIZES.map((size) => (
          <ReqoreTag
            key={size}
            size={size}
            intent='success'
            icon='CheckboxCircleLine'
            label={size}
            onRemoveClick={noop}
          />
        ))}
      </ReqoreTagGroup>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreTagGroup className='appearance-compare'>
        <ReqoreTag intent='danger' icon='ErrorWarningLine' label='Solid' appearance='solid' />
        <ReqoreTag intent='danger' icon='ErrorWarningLine' label='Soft' appearance='soft' />
        <ReqoreTag intent='danger' icon='ErrorWarningLine' label='Text' appearance='text' />
      </ReqoreTagGroup>
    </div>
  );
};

/** WCAG contrast of two `rgb()`/`rgba()` colours, compositing alpha over `under`. */
const parseRgb = (value: string): number[] => (value.match(/[\d.]+/g) || []).map(Number);

const compose = (top: number[], under: number[]): number[] => {
  const alpha = top[3] ?? 1;

  return [0, 1, 2].map((i) => top[i] * alpha + under[i] * (1 - alpha));
};

const luminance = ([r, g, b]: number[]) => {
  const [lr, lg, lb] = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);

  return (hi + 0.05) / (lo + 0.05);
};

/** The opaque colour behind an element: the first ancestor that paints a background. */
const surfaceBehind = (element: HTMLElement): number[] => {
  let node = element.parentElement;

  while (node) {
    const background = parseRgb(getComputedStyle(node).backgroundColor);

    if (background.length && (background[3] ?? 1) === 1) {
      return background;
    }

    node = node.parentElement;
  }

  return [255, 255, 255];
};

const expectAppearance = async (appearance: 'soft' | 'text') => {
  const tags = await waitFor(() => {
    const found = document.querySelectorAll('.appearance-row .reqore-tag');
    // 9 rows × 4 tags
    expect(found.length).toBe(36);
    return Array.from(found) as HTMLElement[];
  });

  for (const tag of tags) {
    const style = getComputedStyle(tag);
    const text = parseRgb(style.color);
    const background = parseRgb(style.backgroundColor);
    const behind = surfaceBehind(tag);

    if (appearance === 'soft') {
      // The ring is drawn inside the edge, and the wash is the colour at 20%.
      expect(style.boxShadow).toContain('inset');
      expect(background[3]).toBeCloseTo(0.2, 2);
    } else {
      expect(style.boxShadow).toBe('none');
      expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    }

    // The label reads on what it sits on: 4.5:1 is the target, measured here against
    // the real page (a shade off the theme's own surface), hence a little slack.
    expect(
      contrast(text, compose(background, behind)),
      `contrast of "${tag.textContent}"`
    ).toBeGreaterThan(4);
  }

  // A chromatic intent keeps its hue: the success label is green, not white or black.
  const [r, g, b] = parseRgb(
    getComputedStyle(document.querySelector('.appearance-row-success .reqore-tag')).color
  );
  expect(g).toBeGreaterThan(r);
  expect(g).toBeGreaterThan(b);

  // The group's appearance reached its tags, and a soft or text tag is exactly the
  // size of a solid one next to it.
  const compare = Array.from(
    document.querySelectorAll('.appearance-compare .reqore-tag')
  ) as HTMLElement[];
  const heights = compare.map((tag) => tag.getBoundingClientRect().height);
  expect(new Set(heights).size).toBe(1);

  // The remove button still renders on every removable tag.
  expect(document.querySelectorAll('.appearance-row .reqore-tag-remove').length).toBe(9);
};

export const Soft: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders `appearance='soft'` tags for every intent, a custom `color`, an `effect.color` and no colour — with icons, a label key, a remove button and a pill — then every size, and a solid / soft / text comparison. Only the 1px ring and the label carry the colour, over a 20% wash of it.",
      },
    },
  },
  render: () => <AppearanceMatrix appearance='soft' />,
  play: async () => expectAppearance('soft'),
};

export const SoftLight: Story = {
  args: { mainTheme: '#f4f4f4' } as Story['args'],
  parameters: {
    docs: {
      description: {
        story:
          "Renders the soft tags on a light theme: the label and ring take a darker shade of each colour, so every intent still reads on its 20% wash.",
      },
    },
  },
  render: () => <AppearanceMatrix appearance='soft' />,
  play: async () => expectAppearance('soft'),
};

export const SoftMobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    qlip: { viewport: { width: 380, height: 900 } },
    docs: {
      description: {
        story:
          'Renders the soft tags on a phone-width screen (captured at 380px): each row wraps onto more lines inside the screen instead of overflowing it.',
      },
    },
  },
  render: () => <AppearanceMatrix appearance='soft' />,
  play: async () => {
    await expectAppearance('soft');

    for (const tag of Array.from(document.querySelectorAll('.appearance-matrix .reqore-tag'))) {
      expect(tag.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
    }
  },
};

export const Text: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders `appearance='text'` tags for every intent, a custom `color`, an `effect.color` and no colour — with icons, a label key, a remove button and a pill — then every size, and a solid / soft / text comparison. Only the label and its icons carry the colour; there is no border and no background.",
      },
    },
  },
  render: () => <AppearanceMatrix appearance='text' />,
  play: async () => expectAppearance('text'),
};

export const TextLight: Story = {
  args: { mainTheme: '#f4f4f4' } as Story['args'],
  parameters: {
    docs: {
      description: {
        story:
          'Renders the text-only tags on a light theme: each label takes a darker shade of its colour, so it still reads on the light surface.',
      },
    },
  },
  render: () => <AppearanceMatrix appearance='text' />,
  play: async () => expectAppearance('text'),
};

export const TextMobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    qlip: { viewport: { width: 380, height: 900 } },
    docs: {
      description: {
        story:
          'Renders the text-only tags on a phone-width screen (captured at 380px): each row wraps onto more lines inside the screen instead of overflowing it.',
      },
    },
  },
  render: () => <AppearanceMatrix appearance='text' />,
  play: async () => {
    await expectAppearance('text');

    for (const tag of Array.from(document.querySelectorAll('.appearance-matrix .reqore-tag'))) {
      expect(tag.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
    }
  },
};
