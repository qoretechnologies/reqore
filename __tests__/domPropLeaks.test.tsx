import isPropValid from '@emotion/is-prop-valid';
import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import {
  DatePicker,
  ReqoreBreadcrumbsItem,
  ReqoreButton,
  ReqoreCheckbox,
  ReqoreCollection,
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreHeader,
  ReqoreIcon,
  ReqoreInput,
  ReqoreKeyValueTable,
  ReqoreLayoutContent,
  ReqoreLink,
  ReqoreMenu,
  ReqoreMenuItem,
  ReqoreMessage,
  ReqoreNavbarGroup,
  ReqoreNavbarItem,
  ReqoreP,
  ReqorePanel,
  ReqorePopover,
  ReqoreSlider,
  ReqoreSpacer,
  ReqoreTabs,
  ReqoreTabsContent,
  ReqoreTabsListItem,
  ReqoreTag,
  ReqoreTextarea,
  ReqoreTimeline,
  ReqoreTree,
  ReqoreUIProvider,
} from '../src';
import { animated } from '@react-spring/web';
import { REQORE_BUTTON_STYLE_PROPS } from '../src/components/Button';
import { REQORE_PANEL_STYLE_PROPS } from '../src/components/Panel';
import { REQORE_TAG_STYLE_PROPS } from '../src/components/Tag';
import { REQORE_TEXTAREA_STYLE_PROPS } from '../src/components/Textarea';
import { REQORE_CONTROL_GROUP_CHILD_PROPS } from '../src/helpers/styled';

/**
 * Styling props must not reach the DOM.
 *
 * Reqore styles its components with props (`fill`, `wrap`, `color`, `opacity`, `theme`, …), and
 * styled-components decides which of them the rendered element gets. A DOM tag only gets what
 * looks like an HTML attribute, which still lets through the names that ARE attributes somewhere
 * (`fill`, `wrap`, `color`, `width`, `direction` …); a component given as `as` (`animated.div`,
 * re-resizable, react-aria's `DateInput`, a router link) gets everything and writes it onto its
 * own element. React then warns ("React does not recognize the `hasIcon` prop", "Received `true`
 * for a non-boolean attribute `fill`") or silently writes `theme="[object Object]"`.
 *
 * React only warns about a prop name ONCE per page, so a console spy cannot tell the second leak
 * of `fill` from the first. This test reads what React actually handed each element instead:
 * React 18 keeps an element's current props on the node, under a `__reactProps$<random>` key.
 */

/** Attributes that exist, but not on the HTML elements a Reqore component renders. */
const NOT_ON_HTML: Record<string, string[]> = {
  // SVG presentation attributes.
  fill: [],
  opacity: [],
  direction: [],
  offset: [],
  spacing: [],
  // Legacy `<font color>` only.
  color: [],
  disabled: ['button', 'input', 'select', 'textarea', 'option', 'optgroup', 'fieldset'],
  readOnly: ['input', 'textarea'],
  label: ['track', 'option', 'optgroup'],
  wrap: ['textarea'],
  width: ['img', 'canvas', 'video', 'iframe', 'input', 'embed', 'object', 'col', 'colgroup'],
  height: ['img', 'canvas', 'video', 'iframe', 'input', 'embed', 'object'],
  type: [
    'input',
    'button',
    'ol',
    'li',
    'a',
    'source',
    'embed',
    'object',
    'script',
    'style',
    'link',
  ],
  value: [
    'input',
    'button',
    'select',
    'textarea',
    'option',
    'li',
    'meter',
    'progress',
    'param',
    'data',
    'output',
  ],
};

/**
 * Attributes of some element that a Reqore component uses for its own meaning (`size='small'`).
 * Checked on the element a component target renders — the stubs below mark theirs — because
 * that element received the props a component was handed, and none of these were the caller's.
 */
const NOT_ON_A_COMPONENT_TARGET = ['size'];

/** Set by the stub components below on the element they render. */
const COMPONENT_TARGET_ATTRIBUTE = 'data-component-target';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const getReactProps = (element: Element): Record<string, unknown> | undefined => {
  const key = Object.keys(element).find((name) => name.startsWith('__reactProps$'));

  return key ? (element as unknown as Record<string, Record<string, unknown>>)[key] : undefined;
};

const describeElement = (element: Element): string => {
  const reqoreClass = Array.from(element.classList).find((name) => name.startsWith('reqore-'));

  return `<${element.tagName.toLowerCase()}${reqoreClass ? `.${reqoreClass}` : ''}>`;
};

/** Every non-DOM prop React was handed for an element of the document, as `<tag.class> prop`. */
const findLeakedProps = (): string[] => {
  const leaks: string[] = [];

  document.body.querySelectorAll('*').forEach((element) => {
    const props = getReactProps(element);

    if (!props || element.namespaceURI === SVG_NAMESPACE) {
      return;
    }

    const tag = element.tagName.toLowerCase();
    const isComponentTarget = element.hasAttribute(COMPONENT_TARGET_ATTRIBUTE);

    Object.entries(props).forEach(([prop, value]) => {
      // React renders nothing for an absent value, and says nothing about it either.
      if (value === undefined || value === null) {
        return;
      }

      if (prop === 'children' || prop.startsWith('data-') || prop.startsWith('aria-')) {
        return;
      }

      const allowedOn = NOT_ON_HTML[prop];

      if (
        !isPropValid(prop) ||
        (allowedOn && !allowedOn.includes(tag)) ||
        (isComponentTarget && NOT_ON_A_COMPONENT_TARGET.includes(prop))
      ) {
        leaks.push(`${describeElement(element)} ${prop}`);
      }
    });
  });

  return [...new Set(leaks)].sort();
};

const REACT_DOM_PROP_WARNINGS = [
  /does not recognize the `/,
  /for a non-boolean attribute/,
  /Invalid value for prop/,
  /Unknown event handler property/,
  /Received NaN for the/,
];

const formatConsoleCall = ([format, ...args]: unknown[]): string => {
  let index = 0;

  return typeof format === 'string'
    ? format.replace(/%s/g, () => String(args[index++]))
    : String(format);
};

const getReactDomPropWarnings = (): string[] =>
  vi
    .mocked(console.error)
    .mock.calls.map(formatConsoleCall)
    .filter((message) => REACT_DOM_PROP_WARNINGS.some((pattern) => pattern.test(message)));

const renderInProvider = (element: ReactElement) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{element}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

/** A router's link: it writes every prop it does not know onto its `<a>`. */
const RouterLinkStub = ({ to, children, ...rest }: any) => (
  <a href={to} {...{ [COMPONENT_TARGET_ATTRIBUTE]: true }} {...rest}>
    {children}
  </a>
);

// A router link's `to`. Typed loosely: the components accept a component's own props through
// `as`, which their prop types cannot name.
const ROUTER_LINK_TO = { to: '/issues' } as Record<string, string>;

/** An editor surface (Slate's `Editable`): it too writes the props it does not know onto its div. */
const EditorStub = ({ value, onChange: _onChange, ...rest }: any) => (
  <div
    contentEditable
    suppressContentEditableWarning
    {...{ [COMPONENT_TARGET_ATTRIBUTE]: true }}
    {...rest}
  >
    {value}
  </div>
);

// `fill` is not a checkbox prop, but a containing control group hands it to every child, and
// consumers pass it the same way.
const FILL = { fill: true } as any;

const CASES: [string, () => ReactElement][] = [
  ['a bare DatePicker', () => <DatePicker value={new Date()} onChange={vi.fn()} />],
  [
    'a minimal pill DatePicker with time',
    () => <DatePicker value={new Date()} onChange={vi.fn()} minimal pill flat rounded />,
  ],
  [
    'filling Tabs',
    () => (
      <ReqoreTabs
        fill
        vertical
        width='300px'
        tabs={[
          { label: 'One', id: 'one' },
          { label: 'Two', id: 'two', wrap: true },
        ]}
      >
        <ReqoreTabsContent tabId='one'>One</ReqoreTabsContent>
        <ReqoreTabsContent tabId='two'>Two</ReqoreTabsContent>
      </ReqoreTabs>
    ),
  ],
  [
    'a filling Collection with a height',
    () => (
      <ReqoreCollection
        fill
        height='300px'
        items={[
          { label: 'One', content: 'One', opacity: 0.5 },
          { label: 'Two', content: 'Two', transparent: true },
        ]}
      />
    ),
  ],
  ['a Checkbox given `fill`', () => <ReqoreCheckbox label='Check' checked {...FILL} />],
  [
    'a filling ControlGroup of Tag, Paragraph, Input, Checkbox and Button',
    () => (
      <ReqoreControlGroup fill stack spaceBetween>
        <ReqoreTag label='Tag' width='100px' actions={[{ icon: 'CloseLine' }]} color='#ff0000' />
        <ReqoreP>Paragraph</ReqoreP>
        <ReqoreInput
          value='Value'
          width={200}
          icon='Search2Line'
          rightIcon='CloseLine'
          onChange={vi.fn()}
        />
        <ReqoreCheckbox label='Check' />
        <ReqoreButton wrap badge={1}>
          Button
        </ReqoreButton>
      </ReqoreControlGroup>
    ),
  ],
  [
    'a Slider in a filling ControlGroup',
    () => (
      <ReqoreControlGroup fill fluid>
        <ReqoreSlider
          value={5}
          onChange={vi.fn()}
          min={0}
          max={10}
          intent='info'
          labelsPosition='top'
          tooltip={undefined}
        />
      </ReqoreControlGroup>
    ),
  ],
  [
    'a resizable Menu with a width',
    () => (
      <ReqoreMenu
        width='300px'
        position='left'
        rounded
        transparent={false}
        showResizableBorder
        resizable={{ enable: { right: true } }}
      >
        <ReqoreMenuItem label='Item' wrap />
      </ReqoreMenu>
    ),
  ],
  [
    'a Link rendered as a router link',
    () => (
      <ReqoreLink as={RouterLinkStub} to='/issues' size='small' intent='info'>
        Go to issues
      </ReqoreLink>
    ),
  ],
  [
    'a Message with a tooltip',
    () => (
      <ReqoreMessage intent='info' tooltip='Tooltip' effect={{ gradient: { colors: 'info' } }}>
        Message
      </ReqoreMessage>
    ),
  ],
  [
    'an open Popover whose content is a DOM element',
    () => (
      <ReqorePopover
        component={ReqoreButton}
        isReqoreComponent
        openOnMount
        handler='click'
        content={<div className='reqore-probe'>Text</div>}
      >
        Open
      </ReqorePopover>
    ),
  ],
  [
    'an open Popover whose content is a Message',
    () => (
      <ReqorePopover
        component={ReqoreButton}
        isReqoreComponent
        openOnMount
        handler='click'
        content={<ReqoreMessage intent='info'>Message</ReqoreMessage>}
      >
        Open
      </ReqorePopover>
    ),
  ],
  [
    'a Timeline with tooltips',
    () => (
      <ReqoreTimeline
        spacing='big'
        items={[
          { title: 'One', tooltip: 'Tooltip', icon: 'CheckLine' },
          { title: 'Two', disabled: true },
        ]}
      />
    ),
  ],
  [
    'a Navbar',
    () => (
      <ReqoreHeader>
        <ReqoreNavbarGroup>
          <ReqoreNavbarItem>Item</ReqoreNavbarItem>
        </ReqoreNavbarGroup>
      </ReqoreHeader>
    ),
  ],
  ['a Tree given a `mode`', () => <ReqoreTree data={{ key: 'value' }} mode='copy' />],
  [
    'a Panel with an opacity and bottom actions',
    () => (
      <ReqorePanel label='Panel' opacity={0.5} bottomActions={[{ label: 'Action' }]}>
        Content
      </ReqorePanel>
    ),
  ],
  [
    'a resizable, rounded, interactive Panel',
    () => (
      <ReqorePanel
        label='Panel'
        resizable={{ enable: { right: true } }}
        rounded
        flat
        fluid
        onClick={vi.fn()}
      >
        Content
      </ReqorePanel>
    ),
  ],
  ['a KeyValueTable', () => <ReqoreKeyValueTable data={{ key: 'value', other: 'value' }} />],
  [
    'a Button rendered as a router link in a vertical stack group',
    () => (
      <ReqoreControlGroup vertical stack fluid spaceBetween>
        <ReqoreButton
          as={RouterLinkStub}
          {...ROUTER_LINK_TO}
          fluid
          compact
          flat
          animated
          maxWidth='200px'
          alignSelf='center'
          rounded
          pill
          raised
          grow={1}
          shrink={1}
          verticalPadding='small'
          radiusSize='big'
          textAlign='center'
          iconsAlign='center'
          active
          minimal
          transparent
          readOnly
          wrap
          size='small'
          icon='CheckLine'
          rightIcon='ArrowRightLine'
          iconColor='info'
          description='Description'
          badge={1}
          indicator
          tooltip='Tooltip'
        >
          Go to issues
        </ReqoreButton>
        <ReqoreButton as={RouterLinkStub} {...ROUTER_LINK_TO} square fixed circle>
          X
        </ReqoreButton>
      </ReqoreControlGroup>
    ),
  ],
  [
    'a Breadcrumbs item rendered as a router link',
    () => (
      <ReqoreBreadcrumbsItem
        as={RouterLinkStub}
        {...ROUTER_LINK_TO}
        label='Issues'
        size='small'
        interactive
      />
    ),
  ],
  [
    'a Menu item rendered as a router link',
    () => (
      <ReqoreMenu>
        <ReqoreMenuItem as={RouterLinkStub} {...ROUTER_LINK_TO} label='Issues' wrap />
      </ReqoreMenu>
    ),
  ],
  [
    'a Tag rendered as a router link in a control group',
    () => (
      <ReqoreControlGroup fill stack>
        <ReqoreTag
          {...({ as: RouterLinkStub, to: '/issues' } as any)}
          label='Tag'
          labelKey='Key'
          width='100px'
          fixed
          minimal
          rounded
          asBadge
          size='small'
          intent='info'
          tooltip='Tooltip'
          onRemoveClick={vi.fn()}
        />
      </ReqoreControlGroup>
    ),
  ],
  [
    'a Paragraph rendered as a router link in a control group',
    () => (
      <ReqoreControlGroup fill>
        <ReqoreP as={RouterLinkStub} {...ROUTER_LINK_TO} size='small' inline tooltip='Tooltip'>
          Paragraph
        </ReqoreP>
      </ReqoreControlGroup>
    ),
  ],
  [
    'a transparent Panel rendered as a router link',
    () => (
      <ReqorePanel
        as={RouterLinkStub}
        {...ROUTER_LINK_TO}
        label='Panel'
        transparent
        flat
        fluid
        rounded
        minimal
        disabled
        opacity={0.5}
        intent='info'
        tooltip='Tooltip'
      >
        Content
      </ReqorePanel>
    ),
  ],
  [
    'a resizable, transparent Panel',
    () => (
      <ReqorePanel
        label='Panel'
        resizable={{ enable: { right: true }, minWidth: 100 }}
        transparent
        minimal
        padded={false}
        contentStyle={{ padding: 0 }}
        badge={1}
      >
        Content
      </ReqorePanel>
    ),
  ],
  [
    'a resizable Panel in a stack group',
    () => (
      <ReqoreControlGroup stack fluid>
        <ReqorePanel label='One' resizable={{ enable: { right: true } }} transparent>
          One
        </ReqorePanel>
        <ReqorePanel label='Two' resizable={{ enable: { right: true } }}>
          Two
        </ReqorePanel>
      </ReqoreControlGroup>
    ),
  ],
  [
    'a Tabs list item rendered as a router link',
    () => (
      <ReqoreTabsListItem
        id='issues'
        as={RouterLinkStub}
        props={ROUTER_LINK_TO}
        label='Issues'
        active
        disabled
        fill
        vertical
        padded={false}
        intent='info'
        size='small'
        activeTabMarker='line'
      />
    ),
  ],
  [
    'a Textarea rendered as an editor component',
    () => (
      <ReqoreTextarea
        as={EditorStub}
        value='Value'
        onChange={vi.fn()}
        flat
        minimal
        rounded={false}
        transparent
        fluid
        fixed
        width={100}
        height={100}
        scaleWithContent
        intent='info'
      />
    ),
  ],
  [
    'an animated Icon in a control group',
    () => (
      <ReqoreControlGroup stack fill customTheme={{ main: '#ff0000' }}>
        <ReqoreIcon
          wrapperElement={animated.span}
          icon='CheckLine'
          size='small'
          margin='right'
          rounded
          interactive
          compact
          intent='info'
        />
        <ReqoreIcon wrapperElement={animated.span} image='image.png' size='small' />
      </ReqoreControlGroup>
    ),
  ],
  ['a Spacer', () => <ReqoreSpacer width={10} height={10} lineSize='normal' />],
];

describe('no styling prop reaches the DOM', () => {
  const originalResizeObserver = globalThis.ResizeObserver;

  beforeAll(() => {
    // jsdom has none; the slider measures its thumbs with one.
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  });

  afterAll(() => {
    globalThis.ResizeObserver = originalResizeObserver;
  });

  beforeEach(() => {
    vi.mocked(console.error).mockClear();
  });

  test.each(CASES)('%s', (_name, element) => {
    renderInProvider(element());

    expect(findLeakedProps()).toEqual([]);
    expect(getReactDomPropWarnings()).toEqual([]);
  });
});

describe('the leak detector', () => {
  // Without these, a detector that found nothing would pass every case above.
  test('finds a styling flag a DOM element was given', () => {
    renderInProvider(
      <div className='reqore-probe' {...({ fill: true, hasIcon: false, width: 10 } as any)} />
    );

    expect(findLeakedProps()).toEqual([
      '<div.reqore-probe> fill',
      '<div.reqore-probe> hasIcon',
      '<div.reqore-probe> width',
    ]);
  });

  test("finds a Reqore `size` a component target's element was given", () => {
    renderInProvider(
      <>
        <RouterLinkStub to='/issues' className='reqore-probe' size='small' />
        <input className='reqore-probe-input' size={10} />
      </>
    );

    expect(findLeakedProps()).toEqual(['<a.reqore-probe> size']);
  });

  test('leaves real attributes, data and aria attributes, and SVG presentation alone', () => {
    renderInProvider(
      <div className='reqore-probe' title='Title' data-fill='true' aria-label='Label'>
        <textarea wrap='soft' />
        <svg width={10} height={10} fill='red'>
          <path d='M0 0' opacity={0.5} />
        </svg>
      </div>
    );

    expect(findLeakedProps()).toEqual([]);
  });
});

test('REQORE_CONTROL_GROUP_CHILD_PROPS names every prop a control group hands its children', () => {
  // The children filter these props by that list; a prop the group starts handing out without
  // being added to it would reach their elements again.
  const handedOut = new Set<string>();
  const Probe = (props: Record<string, unknown>) => {
    Object.keys(props).forEach((prop) => handedOut.add(prop));

    return null;
  };
  const groupProps = {
    fill: true,
    fluid: true,
    fixed: true,
    flat: true,
    minimal: true,
    intent: 'info' as const,
    size: 'small' as const,
    customTheme: { main: '#ff0000' as const },
  };

  renderInProvider(
    <>
      <ReqoreControlGroup {...groupProps}>
        <Probe />
      </ReqoreControlGroup>
      <ReqoreControlGroup {...groupProps} stack>
        <Probe />
        <Probe />
      </ReqoreControlGroup>
    </>
  );

  // `style` is the stack's merged corner radii, which the element is meant to get.
  handedOut.delete('style');

  expect([...handedOut].sort()).toEqual([...REQORE_CONTROL_GROUP_CHILD_PROPS].sort());
});

describe('the style prop lists', () => {
  // The compiler checks each list against its component's prop interface; these check that no
  // list holds a prop the rendered element or component is meant to receive.
  test.each([
    [
      'ReqoreButton',
      REQORE_BUTTON_STYLE_PROPS,
      ['disabled', 'href', 'type', 'onClick', 'children'],
    ],
    ['ReqoreTag', REQORE_TAG_STYLE_PROPS, ['onClick', 'children', 'className', 'style']],
    [
      'ReqoreTextarea',
      REQORE_TEXTAREA_STYLE_PROPS,
      ['value', 'readOnly', 'disabled', 'rows', 'wrap', 'placeholder', 'onChange'],
    ],
    // re-resizable's own props: a `Resizable` panel needs them.
    ['ReqorePanel', REQORE_PANEL_STYLE_PROPS, ['size', 'enable', 'minWidth', 'style', 'children']],
  ])('%s forwards what its element needs', (_name, list: string[], forwarded) => {
    forwarded.forEach((prop) => expect(list).not.toContain(prop));
  });

  test.each([
    ['ReqoreButton', REQORE_BUTTON_STYLE_PROPS, ['fluid', 'compact', 'maxWidth', 'alignSelf']],
    ['ReqorePanel', REQORE_PANEL_STYLE_PROPS, ['transparent', 'flat', 'opacity', 'disabled']],
    ['ReqoreTag', REQORE_TAG_STYLE_PROPS, ['asBadge', 'labelKey', 'width', 'size']],
    ['ReqoreTextarea', REQORE_TEXTAREA_STYLE_PROPS, ['flat', 'minimal', 'rounded', 'width']],
  ])('%s keeps back its styling props', (_name, list: string[], kept) => {
    kept.forEach((prop) => expect(list).toContain(prop));
  });
});
