import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { IReqoreTextareaProps } from '../../components/Textarea';
import { sleep } from '../../helpers/utils';
import { ReqoreButton, ReqoreControlGroup, ReqoreTextarea } from '../../index';
import { StoryMeta } from '../utils';
import { ALL_SIZES, DisabledArg, MinimalArg, RadiusSizeArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreTextareaProps>();

const meta = {
  title: 'Form/TextArea',
  component: ReqoreTextarea,
  args: {
    scaleWithContent: true,
    fluid: undefined,
    placeholder: 'Placeholder',
  },
  argTypes: {
    ...MinimalArg(),
    ...DisabledArg,
    ...SizeArg,
    ...RadiusSizeArg,
    ...createArg('scaleWithContent', {
      name: 'Scale with content',
      description: 'Scale with content',
      control: 'boolean',
      defaultValue: true,
    }),
    ...createArg('fluid', {
      name: 'Fluid',
      description: 'Fluid',
      control: 'boolean',
      defaultValue: undefined,
    }),
    ...createArg('placeholder', {
      name: 'Placeholder',
      description: 'Placeholder',
      control: 'text',
      defaultValue: 'Placeholder',
    }),
  },
} as StoryMeta<typeof ReqoreTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;

const str =
  '✔ Checking your system\n' +
  '✔ Locating Application\n' +
  '✔ Preparing native dependencies\n' +
  '✔ Compiling Main Process Code\n' +
  '✔ Launch Dev Servers\n' +
  '✔ Compiling Preload Scripts\n' +
  '✔ Launching Application\n';

const Template: StoryFn<IReqoreTextareaProps> = (args) => {
  const [value, setValue] = useState(str);

  const handleValueChange = (e) => {
    setValue(e.target.value);
  };

  const handleValueClear = () => {
    setValue('');
  };

  return (
    <>
      <ReqoreControlGroup wrap>
        <ReqoreTextarea {...args} onChange={handleValueChange} onClearClick={handleValueClear} />
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          tooltip={{
            placement: 'right-start',
            content: 'I am a tooltip',
          }}
          minimal
        />
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          tooltip="I'm a tooltip"
          flat
        />
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          disabled
        />
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          readOnly
        />
      </ReqoreControlGroup>
      <br />
      <ReqoreControlGroup wrap>
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          value={value}
        />
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          value={value}
          tooltip={{
            placement: 'right-start',
            content: 'I am a tooltip',
          }}
          minimal
        />
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          value={value}
          tooltip="I'm a tooltip"
          flat
        />
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          value={value}
          disabled
        />
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          value={value}
          readOnly
        />
      </ReqoreControlGroup>
      <br />
      <ReqoreControlGroup fluid>
        <ReqoreTextarea
          {...args}
          onChange={handleValueChange}
          onClearClick={handleValueClear}
          value={value}
          fluid
          focusRules={{ type: 'auto' }}
        />
      </ReqoreControlGroup>
    </>
  );
};

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Textarea in its default configuration.',
      },
    },
  },
  render: Template,
};

export const Info: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Textarea with intent="info".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'info',
  },
};

export const Success: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Textarea with intent="success".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'success',
  },
};

export const Warning: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Textarea with intent="warning".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'warning',
  },
};

export const Danger: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Textarea with intent="danger".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'danger',
  },
};

export const Pending: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Textarea with intent="pending".',
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
          'Renders Textarea with intent="muted".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'muted',
  },
};

export const Custom: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Textarea with a custom theme applied to the main color.',
      },
    },
  },
  render: Template,

  args: {
    customTheme: {
      main: '#38fdb2',
    },
  },
};

export const Effect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Textarea with a gradient/typography effect applied.',
      },
    },
  },
  render: Template,

  args: {
    effect: {
      gradient: {
        type: 'radial',
        colors: {
          0: '#361554',
          50: '#160013',
        },
      },
      spaced: 2,
      color: '#ffffff',
      uppercase: true,
      textSize: 'small',
      weight: 'bold',
    },
  },
};

export const Transparent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Textarea with a transparent background.',
      },
    },
  },
  render: Template,

  args: {
    transparent: true,
    effect: {
      gradient: {
        type: 'radial',
        colors: {
          0: '#361554',
          50: '#160013',
        },
      },
      spaced: 2,
      color: '#ffffff',
      uppercase: true,
      textSize: 'small',
      weight: 'bold',
    },
  },
};

export const WithTemplates: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Textarea with template placeholders wired in.',
      },
    },
  },
  render: (args) => <ReqoreTextarea {...args} />,

  args: {
    templates: {
      handler: 'focus',
      useTargetWidth: true,
      noWrapper: true,
      filterable: false,
      items: [
        {
          label: 'New message in discord',
          icon: 'DiscordLine',
          description: 'When a new message in discord is received',
          items: [
            {
              divider: true,
              label: 'Discord',
            },
            {
              label: 'Author',
              description: 'Author of the message',
              value: '$state:{1.field.author}',
            },
            {
              label: 'Content',
              description: 'Content of the message',
              value: '$state:{1.field.content}',
            },
          ],
        },
        {
          label: 'New event in Google Calendar',
          icon: 'Calendar2Fill',
          description: 'When a new event is created in Google Calendar',
        },
      ],
    },
  },

  play: async () => {
    await sleep(200);
    await fireEvent.focusIn(document.querySelector('textarea'));
    await expect(document.querySelector('.reqore-popover-content')).toBeTruthy();
  },
};

export const RadiusSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Textarea at every radius size to show the border-radius scale.',
      },
    },
  },
  render: () => (
    // Use size='huge' so the larger radii aren't clamped by the textarea's
    // height (clamping is correct CSS behaviour, just visually identical past
    // half-height).
    <ReqoreControlGroup vertical gapSize='small'>
      {ALL_SIZES.map((rs) => (
        <ReqoreTextarea
          key={rs}
          size='huge'
          radiusSize={rs}
          placeholder={`radiusSize="${rs}"`}
          rows={2}
        />
      ))}
    </ReqoreControlGroup>
  ),
};

export const ItemCanBeSelected: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Textarea and selects an item.',
      },
    },
  },
  args: {
    onChange: fn(),
    templates: {
      handler: 'focus',
      useTargetWidth: true,
      noWrapper: true,
      items: [
        {
          label: 'New message in discord',
          icon: 'DiscordLine',
          description: 'When a new message in discord is received',
          items: [
            {
              divider: true,
              label: 'Discord',
            },
            {
              label: 'Author',
              description: 'Author of the message',
              value: '$state:{1.field.author}',
            },
            {
              label: 'Content',
              description: 'Content of the message',
              value: '$state:{1.field.content}',
            },
          ],
        },
        {
          label: 'New event in Google Calendar',
          icon: 'Calendar2Fill',
          description: 'When a new event is created in Google Calendar',
          items: [],
        },
      ],
    },
  },

  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await sleep(200);
    await fireEvent.focusIn(document.querySelector('textarea'));
    await sleep(200);
    await expect(document.querySelector('.reqore-popover-content')).toBeTruthy();
    await sleep(200);
    await fireEvent.click(canvas.getAllByText('New message in discord')[0]);

    await waitFor(async () => {
      await expect(canvas.getAllByText('Author')[0]).toBeTruthy();
    }, {
      timeout: 5000,
    });

    await fireEvent.click(canvas.getAllByText('Author')[0]);

    await expect(canvas.getAllByText('$state:{1.field.author}')[0]).toBeTruthy();
    await expect(args.onChange).toHaveBeenCalledWith({
      target: { value: '$state:{1.field.author}' },
    });
  },
};

export const TemplatesAreNotClosedWhenFocusIsMovedToPopover: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Textarea — the templates popover stays open when focus moves into it.',
      },
    },
  },
  ...WithTemplates,
  play: async ({ canvasElement, args }) => {
    // @ts-expect-error
    await WithTemplates.play({ canvasElement, args });
    await userEvent.click(document.querySelector('textarea'));
    await sleep(500);
    // Press the tab key to move focus to the button
    await userEvent.keyboard('{Tab}');
    await expect(document.querySelector('.reqore-popover-content')).toBeTruthy();
  },
};

export const TemplatesAreClosedWhenFocusIsLost: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Textarea — the templates popover closes when focus leaves the input.',
      },
    },
  },
  ...WithTemplates,
  render: (args) => (
    <ReqoreControlGroup>
      <ReqoreTextarea {...args} />
      <ReqoreButton>Test</ReqoreButton>
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement, args }) => {
    // @ts-expect-error
    await WithTemplates.play({ canvasElement, args });
    await userEvent.click(document.querySelector('textarea'));
    await sleep(500);
    // Press the tab key to move focus to the button
    await userEvent.keyboard('{Tab}');
    await expect(document.querySelector('.reqore-popover-content')).toBeFalsy();
  },
};
