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
