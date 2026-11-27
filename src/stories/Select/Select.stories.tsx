import { StoryFn, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { useState } from 'react';
import ReqoreControlGroup from '../../components/ControlGroup';
import { IReqoreSelectSingleProps, ReqoreSelect } from '../../components/Select';
import ReqoreTag from '../../components/Tag';
import { MultiSelectItems } from '../../mock/multiSelect';
import { IReqoreIconName } from '../../types/icons';
import { StoryMeta } from '../utils';
import { FlatArg, IconArg, MinimalArg, SizeArg, argManager } from '../utils/args';
import { PHONE_STORY, withTouchScreen } from '../utils/touchScreen';
import { withViewport } from '../utils/viewport';
import { ReqoreP } from '../../index';
import { sleep } from '../../helpers/utils';

const { createArg } = argManager<IReqoreSelectSingleProps>();

const meta = {
  title: 'Form/Select',
  component: ReqoreSelect,
  parameters: {
    chromatic: {
      delay: 500,
    },
  },
  args: {
    canCreateItems: true,
    canRemoveItems: true,
    // The value every story STARTS from, so a story that wants a different one
    // (or none) says so in its own args rather than the template hardcoding it.
    value: 'Existing item 3',
  },
  argTypes: {
    ...FlatArg,
    ...MinimalArg(),
    ...SizeArg,
    ...createArg('canCreateItems', {
      defaultValue: true,
      name: 'Can create a value',
      type: 'boolean',
    }),
    ...createArg('canRemoveItems', {
      defaultValue: true,
      name: 'Can clear the value',
      type: 'boolean',
    }),
    ...IconArg('onItemClickIcon', 'Clickable item right icon', null),
  },
  /* Typed with the SINGLE-value props, which is what the shared template
     renders. The component's own props are a union of the single and the
     multi shape, and Storybook's arg typing collapses that union to `never` —
     every story's `args` then failed to type-check. `Multi` sets `multi` in
     its own render. */
} as StoryMeta<(props: IReqoreSelectSingleProps) => JSX.Element>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A story's `value` is where the select STARTS, not what it is pinned to.
 *
 * `{...args}` used to be spread AFTER `value={selected}`, so a story that
 * declared a value re-applied it on every render: picking an item updated the
 * state and the very next render threw the choice away. `Empty` could never be
 * filled in and `ValueOutsideTheList` could never be changed — both looked like
 * a broken control rather than a frozen story.
 */
const Template: StoryFn<IReqoreSelectSingleProps> = ({
  value,
  ...args
}: IReqoreSelectSingleProps) => {
  const [selected, setSelected] = useState<string | undefined>(value);

  return (
    <ReqoreSelect
      {...args}
      value={selected}
      onValueChange={setSelected}
      enterKeySelects
      selectorProps={{
        listHeight: '600px',
        ...args.selectorProps,
      }}
      items={MultiSelectItems}
    />
  );
};

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Select in its default configuration: the chosen value is a chip and the list holds the candidates.',
      },
    },
  },
  render: Template,

  args: {
    onItemClickIcon: 'EditLine',
  },
};

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Select in its empty state.',
      },
    },
  },
  render: Template,

  args: {
    value: undefined,
  },
};

export const ValueOutsideTheList: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Select holding a value that no item offers — the case a creatable field lands in once a value is entered by hand. The chip is drawn from the value itself.',
      },
    },
  },
  render: Template,

  args: {
    value: '$.create.body.items[0].sku',
  },
};

export const NotCreatable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Select as a pure picker: only the offered values can be chosen.',
      },
    },
  },
  render: Template,

  args: {
    canCreateItems: false,
  },
};

export const NotClearable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Select whose chip cannot be removed — for a field that must always hold a value.',
      },
    },
  },
  render: Template,

  args: {
    canRemoveItems: false,
  },
};

export const AutoOpen: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Select that opens its list automatically on mount.',
      },
    },
  },
  render: Template,

  args: {
    openOnMount: true,
  },
};

export const Flat: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Select in its flat variant.',
      },
    },
  },
  render: Template,

  args: {
    flat: true,
  },
};

export const Minimal: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Select in its minimal variant.',
      },
    },
  },
  render: Template,

  args: {
    minimal: true,
  },
};

export const WithCustomEmptyMessage: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders an empty Select with a custom empty-state message.',
      },
    },
  },
  render: Template,

  args: {
    value: undefined,
    selectorProps: { placeholder: 'Pick a value...' },
    noItemsMessageProps: { label: 'Nothing chosen yet', color: 'warning' },
  },
};

export const Clickable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Select whose chip is clickable — the count beside it rises on every click, so the chip is visibly still live after the first one. The play clicks it twice and checks the count reached 2.',
      },
    },
  },
  /* Its own render rather than `Template`: the old story handed `onItemClick` a
     `console.log`, so nothing on screen moved and a reviewer had no way to tell
     a working chip from a dead one — the first click looked like it did
     something and every later click looked identical. What the story is FOR is
     that the chip stays clickable, so it has to show that. */
  render: ({ value, ...args }: IReqoreSelectSingleProps) => {
    const [selected, setSelected] = useState<string | undefined>(value);
    const [clicks, setClicks] = useState(0);

    return (
      <ReqoreControlGroup vertical>
        <ReqoreTag
          className='click-count'
          labelKey='Chip clicks'
          label={clicks}
          intent={clicks ? 'success' : undefined}
        />
        <div className='select-host'>
          <ReqoreSelect
            {...args}
            value={selected}
            onValueChange={setSelected}
            onItemClick={() => setClicks((count) => count + 1)}
            items={MultiSelectItems}
          />
        </div>
      </ReqoreControlGroup>
    );
  },

  args: {
    onItemClickIcon: 'EditLine' as IReqoreIconName,
  },

  play: async () => {
    /* The handler sits on `.reqore-tag-content`, not on `.reqore-tag` — the
       outer span is only the box. Clicking the parent does nothing, because
       events bubble up rather than down. */
    const chip = () =>
      document.querySelector('.select-host .reqore-tag-content') as HTMLElement;

    await userEvent.click(chip());
    await expect(document.querySelector('.click-count')?.textContent).toContain('1');

    await userEvent.click(chip());
    await expect(document.querySelector('.click-count')?.textContent).toContain('2');
  },
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Select in its disabled state.',
      },
    },
  },
  render: Template,

  args: {
    disabled: true,
  },
};

export const WithEffect: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders Select with a visual effect applied.',
      },
    },
  },
  render: Template,

  args: {
    selectedItemEffect: {
      gradient: {
        colors: {
          0: '#7f60ea',
          100: '#00fd67',
        },
      },
    },
    selectorProps: {
      effect: {
        gradient: {
          colors: {
            0: '#7f60ea',
            100: '#00fd67',
          },
        },
      },
    },
  },
};

export const Multi: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Select with `multi`, which is the same component holding many values instead of one — picking a second item adds to the selection rather than replacing it. `ReqoreMultiSelect` is this, with `multi` pre-set.',
      },
    },
  },
  render: (args) => {
    const [selected, setSelected] = useState<string[]>(['Existing item 3', 'Existing item 1']);

    return (
      <ReqoreSelect
        {...args}
        multi
        value={selected}
        onValueChange={setSelected}
        enterKeySelects
        items={MultiSelectItems}
      />
    );
  },
};

/**
 * The value a select item stands for is not always a string. A Qorus form's
 * "hash allowed value" is a whole structure, and the item is one preset the
 * operator can pick — the label is the readable part, the hash is the payload.
 */
const StructuredItems = [
  {
    label: 'Hash Allowed Value 1',
    value: { option1: { subOption1: 'test' }, option2: 500 },
  },
  {
    label: 'Hash Allowed Value 2',
    value: { option1: { subOption1: 'This is a changed value' }, option2: 50000000 },
  },
  // Deliberately unlabelled: what an item with no display name has to fall back
  // on. A scalar reads fine as its own label; the two above cannot, and show
  // none rather than crashing the tag.
  { value: 'a-plain-value' },
];

export const StructuredValues: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Select over items whose values are hashes rather than strings — the shape a Qorus form uses for a hash allowed value. The chosen item shows its label, and the structure it carries stays out of the rendered element.',
      },
    },
  },
  render: (args) => {
    const [selected, setSelected] = useState<unknown>(StructuredItems[0].value);

    return (
      <ReqoreSelect
        {...args}
        value={selected as string}
        onValueChange={setSelected}
        items={StructuredItems as IReqoreSelectSingleProps['items']}
      />
    );
  },
  play: async () => {
    // The label is the readable half and is what the chip shows.
    await expect(document.querySelector('.reqore-tag')?.textContent).toContain(
      'Hash Allowed Value 1'
    );
    /* The half a label cannot carry is offered on HOVER — hover the chip to
       read the hash. That goes through `ReqoreTooltipComponent`, a popover
       rather than a `title` attribute, so its content is asserted in
       `__tests__/selectItem.test.tsx` where it can be checked deterministically
       instead of raced against a popover here. */
    // The payload half is data, and never reaches the DOM — it used to arrive
    // as `value="[object Object]"` on the chip.
    await expect(document.querySelector('.reqore-tag')?.getAttribute('value')).toBe(null);
    await expect(document.body.innerHTML).not.toContain('[object Object]');
  },
};

/* A value big enough that an uncapped preview would run off the screen: forty keys,
   which pretty-prints to forty-two lines. It sits UNDER the 600-character cap, so the
   character limit alone would have let all of it through — the line cap is what holds
   it. */
const HugeStructuredItems = [
  {
    label: 'Huge Hash Allowed Value',
    value: {
      connection: Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`option${i}`, i])),
    },
  },
];

export const StructuredValueTooltipIsBounded: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Hovers the chip of an item whose value is a hash far too large to preview in full. The tooltip stops at twelve lines and says so with an ellipsis, rather than growing a popover taller than the viewport — `InternalPopover` clamps width to the screen but sets no default max-height, and a hover popover cannot be scrolled because it closes when the pointer leaves.',
      },
    },
  },
  render: (args) => {
    const [selected, setSelected] = useState<unknown>(HugeStructuredItems[0].value);

    return (
      <ReqoreSelect
        {...args}
        value={selected as string}
        onValueChange={setSelected}
        items={HugeStructuredItems as IReqoreSelectSingleProps['items']}
      />
    );
  },
  play: async ({ canvasElement }) => {
    await userEvent.hover(canvasElement.querySelector('.reqore-tag')!);

    const preview = await waitFor(() => {
      const node = document.querySelector('.reqore-select-item-value-preview');
      expect(node).toBeTruthy();
      return node as HTMLElement;
    });

    // Twelve lines of value plus the ellipsis that says there is more.
    const text = preview.textContent ?? '';
    await expect(text.split('\n')).toHaveLength(13);
    await expect(text.endsWith('…')).toBe(true);

    /* The assertion that matters is the rendered one: the popover has no default
       max-height, so an uncapped preview would simply grow. Forty-two lines at this
       size is around 700px; bounded, it is a fraction of that and comfortably inside
       the viewport. */
    const popover = preview.closest('.reqore-popover-content') ?? preview.parentElement!;
    await expect(popover.getBoundingClientRect().height).toBeLessThan(
      window.innerHeight / 2
    );
  },
};

/** The select's own text box, where it is typed in and tapped. */
const selectInput = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('.reqore-input input, input') as HTMLInputElement;

/** The list of choices, while it is open. */
const choicesList = () => document.querySelector('.reqore-popover-content');

export const FocusedThenTappedOnAPhoneKeepsItsChoices: Story = {
  tags: ['touch'],
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          "Renders an empty Select on a phone (390 px) whose box has the focus, as a form that focuses its first field leaves it: its list stays closed, since a focus is no request for it. A finger taps the box and the list opens, then taps it again and the list stays open, and a choice can still be seen and picked; once picked, the box has the focus back and its list stays closed. The list opens one way only, at the tap: when a focus opened it too, the tap's click toggled shut what the focus had shown.",
      },
    },
  },
  render: Template,
  args: {
    value: undefined,
  },
  play: async ({ canvasElement }) => {
    const input = selectInput(canvasElement);
    input.focus();
    await sleep(300);
    await expect(choicesList(), 'a focus leaves the list closed').toBeNull();

    await withTouchScreen(async (touch) => {
      await touch.tap(input);
      await waitFor(() => expect(choicesList()).toBeTruthy());
      await touch.tap(input);
      await waitFor(() => expect(choicesList()).toBeTruthy());

      // a choice is there to read and to pick
      await touch.tap(await waitFor(() => within(document.body).getByText('Existing item 3')));
    });
    await waitFor(() => expect(choicesList()).toBeNull());
    await expect(canvasElement.querySelector('.reqore-tag')).toHaveTextContent('Existing item 3');
    // the box has the focus back, not the page, and its list stays closed
    await waitFor(() => expect(document.activeElement, 'the box has the focus again').toBe(input));
    await sleep(300);
    await expect(choicesList(), 'the focus did not open the list again').toBeNull();
  },
};

export const FocusedThenClickedKeepsItsChoices: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders an empty Select whose box has the focus, its list closed, and clicks the box twice with the mouse: the first click opens the list and the second leaves it open. Only a click outside, Escape or a pick closes it - a click on the box it was opened from never does.',
      },
    },
    // Interaction-only: the open list is pictured by `FocusedThenTappedOnAPhoneKeepsItsChoices`.
    qlip: { skip: true },
  },
  render: Template,
  args: {
    value: undefined,
  },
  play: async ({ canvasElement }) => {
    const input = selectInput(canvasElement);
    input.focus();
    await sleep(300);
    await expect(choicesList(), 'a focus leaves the list closed').toBeNull();

    await userEvent.click(input);
    await waitFor(() => expect(choicesList()).toBeTruthy());
    await userEvent.click(input);
    await waitFor(() => expect(choicesList()).toBeTruthy());

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(choicesList()).toBeNull());
  },
};

export const AFocusFromCodeLeavesTheListClosed: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders an empty Select whose box a form has put the caret in (a focus from code, as a form that focuses its first field gives): the list stays closed. The keyboard asks for it with ArrowDown, ArrowUp, or Enter with nothing typed, and Escape puts it away again.',
      },
    },
    // Interaction-only: the open list is pictured by `FocusedThenTappedOnAPhoneKeepsItsChoices`.
    qlip: { skip: true },
  },
  render: Template,
  args: {
    value: undefined,
  },
  play: async ({ canvasElement }) => {
    const input = selectInput(canvasElement);
    input.focus();
    await sleep(300);
    await expect(choicesList(), 'a focus leaves the list closed').toBeNull();

    for (const key of ['{ArrowDown}', '{ArrowUp}', '{Enter}']) {
      await userEvent.keyboard(key);
      await waitFor(() => expect(choicesList(), `${key} opens the list`).toBeTruthy());
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(choicesList()).toBeNull());
    }
  },
};

/** A form with its labels to the left of its fields, and room for a list only beside the field. */
const LabelledSelect = () => {
  const [selected, setSelected] = useState<string | undefined>();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 400, padding: '0 16px' }}>
      <ReqoreP className='form-label' style={{ flex: '0 0 420px' }}>
        Interface kind
      </ReqoreP>
      <div style={{ flex: '0 0 300px' }}>
        <ReqoreSelect
          value={selected}
          onValueChange={setSelected}
          items={MultiSelectItems}
          selectorProps={{ listHeight: '600px' }}
        />
      </div>
    </div>
  );
};

export const InANarrowFormTheListSitsUnderItsInput: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A Select in a form with its label to the left of its field, in a window too short for its list above or below the field, with room beside it over the label. Opened, the list sits under the field (or over it), aligned with it, and never beside it over the label: placed where there was the most room, it lay over the form labels.',
      },
    },
    qlip: { viewport: { width: 800, height: 420 } },
  },
  render: () => <LabelledSelect />,
  play: async ({ canvasElement }) => {
    await withViewport(800, 420, async () => {
      const input = selectInput(canvasElement);
      await userEvent.click(input);
      const list = await waitFor(() => {
        const element = document.querySelector<HTMLElement>('[data-popper-placement]');
        expect(element, 'the list is open').toBeTruthy();
        return element!;
      });
      await waitFor(() =>
        expect(list.getAttribute('data-popper-placement'), 'under or over the field').toMatch(
          /^(bottom|top)/
        )
      );
      const box = input.getBoundingClientRect();
      const label = canvasElement.querySelector('.form-label')!.getBoundingClientRect();
      const placed = list.getBoundingClientRect();
      await expect(Math.abs(placed.left - box.left), 'aligned with the field').toBeLessThan(24);
      await expect(placed.left, 'not over the label').toBeGreaterThanOrEqual(label.right);
    });
  },
};
