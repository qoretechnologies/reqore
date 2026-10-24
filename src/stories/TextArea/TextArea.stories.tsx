import { expect, fireEvent, fn, userEvent, waitFor, within } from 'storybook/test';
import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { IReqoreTextareaProps } from '../../components/Textarea';
import { sleep } from '../../helpers/utils';
import { ReqoreButton, ReqoreControlGroup, ReqoreTextarea } from '../../index';
import { StoryMeta } from '../utils';
import { StoryForm, storyFormText } from '../utils/formPreview';
import { requiredElement } from '../utils/required';
import { PHONE_STORY } from '../utils/touchScreen';
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

export const ScaleWithMinimumRows: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'With `scaleWithContent`, `rows` is the floor: the empty textarea starts at 3 visible lines and grows with the content instead of collapsing to one line.',
      },
    },
  },
  render: (args) => (
    <ReqoreTextarea {...args} placeholder='Starts at three rows…' scaleWithContent rows={3} />
  ),
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

/* -------------------------------------------------------------------------------------------
 * Form attributes: every `<textarea>` attribute reaches the element.
 * ----------------------------------------------------------------------------------------- */

const AboutForm = () => {
  const [value, setValue] = useState('Integration lead at a mid-sized bank.');

  return (
    <StoryForm>
      <ReqoreControlGroup vertical fluid>
        <ReqoreTextarea
          name='about'
          required
          maxLength={120}
          minLength={10}
          fluid
          scaleWithContent
          rows={3}
          placeholder='Tell us about yourself'
          className='story-about'
          value={value}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setValue(event.target.value)}
        />
        <ReqoreButton type='submit' intent='info' fixed>
          Save profile
        </ReqoreButton>
      </ReqoreControlGroup>
    </StoryForm>
  );
};

export const FormAttributes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a textarea named `about` (required, 10 to 120 characters) inside a form. The form posts it under its own name; typing more is posted as typed, and "Save profile" submits it.',
      },
    },
  },
  render: AboutForm,
  play: async () => {
    const textarea = await waitFor(() => {
      const element = document.querySelector('textarea.story-about') as HTMLTextAreaElement;
      expect(element).toBeTruthy();
      return element;
    });

    expect(textarea.name).toBe('about');
    expect(textarea.required).toBe(true);
    expect(textarea.maxLength).toBe(120);
    expect(textarea.minLength).toBe(10);
    await waitFor(() =>
      expect(storyFormText('posts')).toBe('about=Integration lead at a mid-sized bank.')
    );

    await userEvent.type(textarea, ' Ten years of EDI.');
    await userEvent.click(document.querySelector('button[type="submit"]'));

    await waitFor(() =>
      expect(storyFormText('submitted')).toBe(
        'about=Integration lead at a mid-sized bank. Ten years of EDI.'
      )
    );
  },
};

export const FormAttributesMobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    qlip: { viewport: { width: 380, height: 700 } },
    docs: {
      description: {
        story:
          'Renders the profile form on a phone-width screen (380px): the named textarea fills the width and its text wraps inside it.',
      },
    },
  },
  render: AboutForm,
  play: async () => {
    await waitFor(() =>
      expect(storyFormText('posts')).toBe('about=Integration lead at a mid-sized bank.')
    );
    const form = document.querySelector('.story-form') as HTMLElement;
    expect(form.scrollWidth).toBeLessThanOrEqual(form.clientWidth + 1);
  },
};

const fieldTemplates = {
  items: [
    { label: 'bestellnummer', value: '$record:{bestellnummer}' },
    { label: 'pos', value: '$record:{pos}' },
  ],
};

const EscapeInAnEditor = () => {
  const [heard, setHeard] = useState(0);
  return (
    <div
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setHeard((count) => count + 1);
        }
      }}
    >
      <ReqoreTextarea templates={fieldTemplates} onChange={() => undefined} />
      <span className='escapes-heard' data-count={heard}>
        Escape heard by the editor around the field: {heard}
      </span>
    </div>
  );
};

export const EscapeClosesTheListNotTheEditorAroundIt: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders Textarea with a list of templates, inside an editor that discards on Escape. With the list open, Escape closes the list and goes no further: the editor around the field does not hear it, and the field keeps the cursor. With no list open, Escape is the editor's.",
      },
    },
  },
  render: () => <EscapeInAnEditor />,
  play: async ({ canvasElement }) => {
    const field = canvasElement.querySelector('textarea') as HTMLTextAreaElement;
    const heard = () => Number(canvasElement.querySelector('.escapes-heard')?.getAttribute('data-count'));
    await userEvent.click(field);
    await waitFor(() => expect(document.querySelector('.reqore-popover-content')).toBeTruthy());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(document.querySelector('.reqore-popover-content')).toBeFalsy());
    await expect(heard()).toBe(0);
    await expect(document.activeElement).toBe(field);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(heard()).toBe(1));
  },
};

/* -------------------------------------------------------------------------------------------
 * Scaled to its text: a field that scales with its content is as high as its text, padding and
 * border, whatever its border, size and box-sizing, and at whatever width it is drawn.
 * ----------------------------------------------------------------------------------------- */

const LONG_NOTE =
  'Orders are exported once all of their lines are picked. A line that is short is held back, ' +
  'and the order waits for it, so that the customer gets one delivery and one invoice.';

/** The scaled-to-its-text fields: each border, a size each way, and a content box. */
const SCALED_FIELDS: { name: string; props: IReqoreTextareaProps }[] = [
  { name: 'bordered', props: {} },
  { name: 'minimal', props: { minimal: true } },
  { name: 'flat', props: { flat: true } },
  { name: 'small', props: { size: 'small' } },
  { name: 'big', props: { size: 'big' } },
  // a content box's padding (6px) and border (1px) are outside its width: it leaves room for them
  {
    name: 'content-box',
    props: { style: { boxSizing: 'content-box', width: 'calc(100% - 14px)' } },
  },
];

/**
 * Whether `textarea` has text past its box: something to scroll, and a scrollbar where the
 * platform draws them.
 */
const textPastItsBox = (textarea: HTMLTextAreaElement, what: string): string[] => {
  const { scrollHeight: text, clientHeight: box } = textarea;

  return text > box ? [`${what}: ${text}px of text and padding in a ${box}px box`] : [];
};

/**
 * Whether `textarea`'s box is higher than its text and padding. What the text needs is read with
 * the field's height and min-height set aside for the reading, with no scrollbar and at the width
 * the field is drawn at: where the platform draws classic scrollbars, a field too low for its text
 * keeps room for one even at no height, and its text wraps narrower than it is drawn; and a field
 * as wide as its columns is narrower with no scrollbar, which it counts in its width while it may
 * scroll. All of it is put back before anything is drawn. It writes to the page, so it is read
 * once the field has settled, never in a `waitFor`: each write would run the `waitFor` again.
 */
const boxPastItsText = (textarea: HTMLTextAreaElement, what: string): string[] => {
  const box = textarea.clientHeight;
  const { height, minHeight, overflowY, width } = textarea.style;
  textarea.style.width = getComputedStyle(textarea).width;
  textarea.style.minHeight = '0';
  textarea.style.height = '0';
  textarea.style.overflowY = 'hidden';
  const needed = textarea.scrollHeight;
  textarea.style.overflowY = overflowY;
  textarea.style.height = height;
  textarea.style.minHeight = minHeight;
  textarea.style.width = width;

  return box - needed > 1 ? [`${what}: a ${box}px box for ${needed}px of text and padding`] : [];
};

/** The fields show all of their text and no more: no text past its box, no box past its text. */
const expectFieldsHoldTheirText = async (
  fields: { textarea: HTMLTextAreaElement; what: string }[]
) => {
  const expectNone = (misses: string[]) => expect(misses, misses.join('; ')).toEqual([]);

  await waitFor(() =>
    expectNone(fields.flatMap(({ textarea, what }) => textPastItsBox(textarea, what)))
  );
  expectNone(fields.flatMap(({ textarea, what }) => boxPastItsText(textarea, what)));
};

const ScaledFields = ({ width }: { width?: number }) => (
  <div className='story-scaled-fields' style={{ display: 'flex', flexFlow: 'column', gap: 12 }}>
    {SCALED_FIELDS.map(({ name, props }) => (
      <div key={name} style={{ width, maxWidth: '100%' }}>
        <ReqoreTextarea
          {...props}
          className={`story-scaled-${name}`}
          fluid
          scaleWithContent
          value={LONG_NOTE}
        />
      </div>
    ))}
  </div>
);

const expectScaledFieldsHoldTheirText = async () => {
  const fields = await waitFor(() =>
    SCALED_FIELDS.map(({ name }) => ({
      what: `the ${name} field`,
      textarea: requiredElement<HTMLTextAreaElement>(
        `textarea.story-scaled-${name}`,
        `the ${name} field`
      ),
    }))
  );
  await expectFieldsHoldTheirText(fields);
};

export const ScaledToItsTextInsideItsBorder: Story = {
  // run again where scrollbars take room: a field is measured while its text overflows
  tags: ['scrollbars'],
  parameters: {
    docs: {
      description: {
        story:
          'Renders a long note in fields that scale with their content, 360px wide: bordered, minimal, flat, small, big and one laid out in a content box. Each is as high as its text, padding and border: all of the note shows, with nothing to scroll and no empty line under it.',
      },
    },
  },
  render: () => <ScaledFields width={360} />,
  play: expectScaledFieldsHoldTheirText,
};

export const ScaledToItsTextOnAPhone: Story = {
  // not `scrollbars`: a phone draws its scrollbars over the content
  tags: ['touch'],
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          'Renders the same fields across a phone (390px). Each wraps the note to the screen and is as high as its text, padding and border: all of it shows, with nothing to scroll and no empty line under it.',
      },
    },
  },
  render: () => <ScaledFields />,
  // run on the phone by its `touch` tag (vitest.config.mts); it holds at any width it is opened at
  play: expectScaledFieldsHoldTheirText,
};

/** Every 20px from 200px to 600px: the widths of the at-every-width story's fluid fields. */
const EVERY_WIDTH = Array.from({ length: 21 }, (_, index) => 200 + index * 20);

/** Every 2 columns from 16 to 40: the columns of the at-every-width story's other fields. */
const EVERY_COLS = Array.from({ length: 13 }, (_, index) => 16 + index * 2);

const AT_EVERY_WIDTH = [
  ...EVERY_WIDTH.map((width) => ({ name: `at-${width}`, what: `the field ${width}px wide` })),
  ...EVERY_COLS.map((cols) => ({ name: `cols-${cols}`, what: `the field ${cols} columns wide` })),
];

const FieldsAtEveryWidth = () => (
  <div style={{ display: 'flex', flexFlow: 'column', gap: 12 }}>
    <div style={{ display: 'flex', flexFlow: 'row wrap', gap: 12, alignItems: 'flex-start' }}>
      {EVERY_WIDTH.map((width) => (
        <div key={width} style={{ width, maxWidth: '100%' }}>
          <ReqoreTextarea
            className={`story-scaled-at-${width}`}
            fluid
            scaleWithContent
            value={LONG_NOTE}
          />
        </div>
      ))}
    </div>
    <div style={{ display: 'flex', flexFlow: 'row wrap', gap: 12, alignItems: 'flex-start' }}>
      {EVERY_COLS.map((cols) => (
        <ReqoreTextarea
          key={cols}
          className={`story-scaled-cols-${cols}`}
          cols={cols}
          scaleWithContent
          value={LONG_NOTE}
        />
      ))}
    </div>
  </div>
);

export const ScaledToItsTextAtEveryWidth: Story = {
  // run again where scrollbars take room: a field is measured while its text overflows
  tags: ['scrollbars'],
  parameters: {
    docs: {
      description: {
        story:
          'Renders the long note in fields that scale with their content: fluid ones from 200px to 600px wide, 20px apart, and ones as wide as their columns, from 16 to 40. Each is as high as its text, padding and border at its width, with nothing to scroll and no empty line under it, also where the platform draws scrollbars, which take room from the text.',
      },
    },
  },
  render: () => <FieldsAtEveryWidth />,
  play: async () => {
    const fields = await waitFor(() =>
      AT_EVERY_WIDTH.map(({ name, what }) => ({
        what,
        textarea: requiredElement<HTMLTextAreaElement>(`textarea.story-scaled-${name}`, what),
      }))
    );
    await expectFieldsHoldTheirText(fields);
  },
};

const FieldsThatChangeWidth = () => {
  const [narrowed, setNarrowed] = useState(false);
  const [shown, setShown] = useState(false);

  return (
    <div style={{ display: 'flex', flexFlow: 'column', gap: 12, alignItems: 'flex-start' }}>
      <ReqoreButton className='story-narrow-the-note' onClick={() => setNarrowed(true)}>
        Narrow the note
      </ReqoreButton>
      <div style={{ width: narrowed ? 200 : 520, maxWidth: '100%' }}>
        <ReqoreTextarea
          className='story-scaled-narrowed'
          fluid
          scaleWithContent
          value={LONG_NOTE}
        />
      </div>
      <ReqoreButton className='story-show-the-note' onClick={() => setShown(true)}>
        Show the hidden note
      </ReqoreButton>
      <div style={{ display: shown ? 'block' : 'none', width: 360, maxWidth: '100%' }}>
        <ReqoreTextarea className='story-scaled-shown' fluid scaleWithContent value={LONG_NOTE} />
      </div>
    </div>
  );
};

export const ScaledToItsTextWhenItsWidthChanges: Story = {
  // run again where scrollbars take room: a field is measured while its text overflows
  tags: ['scrollbars'],
  parameters: {
    docs: {
      description: {
        story:
          'Renders a long note in a field that scales with its content, and another one hidden. "Narrow the note" narrows the first from 520px to 200px, and "Show the hidden note" shows the second: each then wraps the note to its new width and grows with it, so all of it shows, with nothing to scroll.',
      },
    },
  },
  render: () => <FieldsThatChangeWidth />,
  play: async () => {
    const narrowed = await waitFor(() =>
      requiredElement<HTMLTextAreaElement>('textarea.story-scaled-narrowed', 'the field to narrow')
    );
    await expectFieldsHoldTheirText([{ textarea: narrowed, what: 'the field at 520px' }]);
    await userEvent.click(requiredElement('.story-narrow-the-note', 'the narrowing button'));
    await waitFor(() => expect(narrowed.getBoundingClientRect().width).toBe(200));
    await expectFieldsHoldTheirText([{ textarea: narrowed, what: 'the field narrowed to 200px' }]);

    await userEvent.click(requiredElement('.story-show-the-note', 'the showing button'));
    const shown = requiredElement<HTMLTextAreaElement>(
      'textarea.story-scaled-shown',
      'the shown field'
    );
    // shown: it has a width (360px, or the screen's on a phone)
    await waitFor(() => expect(shown.getBoundingClientRect().width).toBeGreaterThan(0));
    await expectFieldsHoldTheirText([{ textarea: shown, what: 'the field shown' }]);
  },
};
