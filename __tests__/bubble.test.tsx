import { render } from '@testing-library/react';
import { ReqoreBubble, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

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

test('Renders <Bubble /> title and detail', () => {
  renderBubbles(
    <ReqoreBubble title='Ada Lovelace' detail='2h ago'>
      Hello
    </ReqoreBubble>
  );

  expect(document.querySelectorAll('.reqore-bubble-header').length).toBe(1);
  expect(document.querySelector('.reqore-bubble-title').textContent).toBe('Ada Lovelace');
  expect(document.querySelector('.reqore-bubble-detail').textContent).toBe('2h ago');
});

test('Renders no <Bubble /> header when neither title nor detail is given', () => {
  renderBubbles(<ReqoreBubble>Hello</ReqoreBubble>);

  expect(document.querySelector('.reqore-bubble-header')).toBeNull();
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

  expect(rows.length).toBe(2);
  expect(rows[0].firstElementChild.className).toContain('reqore-bubble-avatar');
  expect(rows[0].lastElementChild.className).toContain('reqore-bubble');
  expect(rows[1].firstElementChild.className).toContain('reqore-bubble');
  expect(rows[1].lastElementChild.className).toContain('reqore-bubble-avatar');
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

test('Renders an image <Bubble /> avatar', () => {
  renderBubbles(
    <ReqoreBubble avatar={{ image: 'https://example.com/logo.png' }}>Hello</ReqoreBubble>
  );

  expect(document.querySelectorAll('.reqore-bubble-avatar').length).toBe(1);
  expect(document.querySelector('.reqore-bubble-avatar img').getAttribute('src')).toBe(
    'https://example.com/logo.png'
  );
});
