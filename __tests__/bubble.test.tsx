import { render } from '@testing-library/react';
import {
  ReqoreBubble,
  ReqoreBubbleGroup,
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';

const renderBubbles = (children: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{children}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

test('Renders <Bubble /> properly', () => {
  renderBubbles(
    <>
      <ReqoreBubble align='left'>Hello</ReqoreBubble>
      <ReqoreBubble align='right'>Hi</ReqoreBubble>
    </>
  );

  expect(document.querySelectorAll('.reqore-bubble').length).toBe(2);
});

test('Renders <Bubble /> label', () => {
  renderBubbles(<ReqoreBubble label='Ada Lovelace'>Hello</ReqoreBubble>);

  expect(document.querySelectorAll('.reqore-bubble-header').length).toBe(1);
  expect(document.querySelector('.reqore-bubble-label').textContent).toBe('Ada Lovelace');
});

test('Renders no <Bubble /> header when no label is given', () => {
  renderBubbles(<ReqoreBubble>Hello</ReqoreBubble>);

  expect(document.querySelector('.reqore-bubble-header')).toBeNull();
});

// The time belongs under the bubble, not inside it — the way conversational UIs
// print it. Inside the box it reads as part of the message.
test('Renders the <Bubble /> timestamp below the bubble, not within it', () => {
  renderBubbles(<ReqoreBubble timestamp='2h ago'>Hello</ReqoreBubble>);

  const stamp = document.querySelector('.reqore-bubble-timestamp');

  expect(stamp.textContent).toBe('2h ago');
  expect(document.querySelector('.reqore-bubble').contains(stamp)).toBe(false);
  expect(stamp.closest('.reqore-bubble-stack')).not.toBeNull();
});

// Only an `avatar` introduces the row wrapper. Bubbles that predate the prop must
// keep rendering bare, otherwise every existing transcript silently gains a level
// of nesting and loses its own alignment.
test('Renders <Bubble /> without an avatar row when no avatar is given', () => {
  renderBubbles(<ReqoreBubble align='right'>Hello</ReqoreBubble>);

  expect(document.querySelector('.reqore-bubble-avatar')).toBeNull();
  expect(document.querySelector('.reqore-bubble-row')).toBeNull();
  expect(document.querySelector('.reqore-bubble').closest('.reqore-bubble-row')).toBeNull();
});

// A `maxWidth` bubble that gets a timestamp is wrapped in a stack. The cap has to
// move onto that stack (with the bubble filling it) and the stack must be able to
// shrink — otherwise the cap resolves against a content-sized wrapper and the
// bubble runs off-screen at narrow widths instead of wrapping.
test('Caps the timestamp stack, not the bubble, so a capped bubble can still wrap', () => {
  renderBubbles(
    <ReqoreBubble timestamp='2h ago' maxWidth='76%'>
      Hello
    </ReqoreBubble>
  );

  const stack = document.querySelector('.reqore-bubble-stack');
  const bubble = stack.querySelector('.reqore-bubble');

  expect(getComputedStyle(stack).maxWidth).toBe('76%');
  expect(getComputedStyle(stack).minWidth).toBe('0px');
  // the bubble no longer carries the cap itself — it fills the capped stack
  expect(getComputedStyle(bubble).maxWidth).toBe('100%');
});

// The avatar leads on the left and trails on the right, so it always sits on the
// transcript's outer edge instead of between the two columns of text.
test('Renders the <Bubble /> avatar on the side the bubble hugs', () => {
  renderBubbles(
    <>
      <ReqoreBubble align='left' avatar={{ icon: 'User3Line' }}>
        Hello
      </ReqoreBubble>
      <ReqoreBubble align='right' avatar={{ icon: 'CustomerService2Line' }}>
        Hi
      </ReqoreBubble>
    </>
  );

  const rows = document.querySelectorAll('.reqore-bubble-row');

  // `classList.contains` rather than a substring match on className — the latter
  // would happily pass on `reqore-bubble-stack` and prove nothing.
  expect(rows.length).toBe(2);
  expect(rows[0].firstElementChild.classList.contains('reqore-bubble-avatar')).toBe(true);
  expect(rows[0].lastElementChild.classList.contains('reqore-bubble')).toBe(true);
  expect(rows[1].firstElementChild.classList.contains('reqore-bubble')).toBe(true);
  expect(rows[1].lastElementChild.classList.contains('reqore-bubble-avatar')).toBe(true);
});

// `radiusSize` opts both the bubble and its avatar onto the pronounced scale.
// Without it they derive from `size`, so the two paths must differ visibly.
test('Renders <Bubble /> corners from radiusSize when given, from size otherwise', () => {
  const { unmount } = renderBubbles(
    <ReqoreBubble avatar={{ icon: 'User3Line' }}>Hello</ReqoreBubble>
  );
  const bySize = {
    bubble: getComputedStyle(document.querySelector('.reqore-bubble')).borderRadius,
    avatar: getComputedStyle(document.querySelector('.reqore-bubble-avatar')).borderRadius,
  };
  unmount();

  renderBubbles(
    <ReqoreBubble avatar={{ icon: 'User3Line' }} radiusSize='massive'>
      Hello
    </ReqoreBubble>
  );
  const byRadiusSize = {
    bubble: getComputedStyle(document.querySelector('.reqore-bubble')).borderRadius,
    avatar: getComputedStyle(document.querySelector('.reqore-bubble-avatar')).borderRadius,
  };

  expect(bySize.bubble).toBe('15px');
  expect(bySize.avatar).toBe('8px');
  expect(byRadiusSize.bubble).toBe('70px');
  expect(byRadiusSize.avatar).toBe('36px');
});

// A run of same-side bubbles is one moment: only its last bubble prints a time,
// so a burst of messages doesn't repeat the clock. Matches Qonsole's rule.
test('Renders one timestamp per same-side run inside a <BubbleGroup />', () => {
  renderBubbles(
    <ReqoreBubbleGroup>
      <ReqoreBubble align='right' timestamp='10:40 AM'>
        Two messages…
      </ReqoreBubble>
      <ReqoreBubble align='right' timestamp='10:41 AM'>
        …sent together
      </ReqoreBubble>
      <ReqoreBubble align='left' timestamp='10:42 AM'>
        A reply
      </ReqoreBubble>
    </ReqoreBubbleGroup>
  );

  const stamps = [...document.querySelectorAll('.reqore-bubble-timestamp')].map(
    (node) => node.textContent
  );

  // the right-side run collapses onto its last time; the lone left bubble keeps its own
  expect(stamps).toEqual(['10:41 AM', '10:42 AM']);
});

test('Renders an image <Bubble /> avatar', () => {
  renderBubbles(
    <ReqoreBubble avatar={{ image: 'https://example.com/logo.png' }}>Hello</ReqoreBubble>
  );

  expect(document.querySelectorAll('.reqore-bubble-avatar').length).toBe(1);
  expect(document.querySelector('.reqore-bubble-avatar img').getAttribute('src')).toBe(
    'https://example.com/logo.png'
  );
});
