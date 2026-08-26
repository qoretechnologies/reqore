import { fireEvent, render, screen } from '@testing-library/react';
import { noop } from 'lodash';
import {
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreLayoutContent,
  ReqoreTag,
  ReqoreTagGroup,
  ReqoreUIProvider,
} from '../src';

test('Renders <Tag /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreControlGroup minimal>
            <ReqoreTag icon='24HoursLine' rightIcon='4kLine' onClick={noop} onRemoveClick={noop} />
            <ReqoreTag
              icon='24HoursLine'
              rightIcon='4kLine'
              onClick={noop}
              onRemoveClick={noop}
              size='big'
            />
            <ReqoreTag
              icon='24HoursLine'
              rightIcon='4kLine'
              onClick={noop}
              onRemoveClick={noop}
              size='small'
            />
          </ReqoreControlGroup>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-tag').length).toBe(3);
});

test('Does not forward tag layout props to DOM elements', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreTagGroup wrap fluid align='center' gapSize='small'>
        <ReqoreTag label='Wrapped tag' wrap width='180px' />
      </ReqoreTagGroup>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('[wrap]')).toBeNull();
  expect(document.querySelector('[haswidth]')).toBeNull();
  expect(document.querySelector('[gapsize]')).toBeNull();
  expect(document.querySelector('[fluid]')).toBeNull();
  expect(document.querySelector('[align]')).toBeNull();
});

test('Renders <Tag /> group properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreControlGroup minimal>
            <ReqoreTagGroup>
              <ReqoreTag
                icon='24HoursLine'
                rightIcon='4kLine'
                onClick={noop}
                onRemoveClick={noop}
                label='Label'
              />
              <ReqoreTag
                icon='24HoursLine'
                rightIcon='4kLine'
                onClick={noop}
                onRemoveClick={noop}
                size='big'
              />
              <ReqoreTag
                icon='24HoursLine'
                rightIcon='4kLine'
                onClick={noop}
                onRemoveClick={noop}
                size='small'
                label='Wazzup'
              />
            </ReqoreTagGroup>
          </ReqoreControlGroup>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-tag').length).toBe(3);
  expect(document.querySelectorAll('.reqore-tag-group').length).toBe(1);
});

test('Renders <Tag /> without remove button if disabled', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreControlGroup minimal>
            <ReqoreTagGroup>
              <ReqoreTag
                icon='24HoursLine'
                rightIcon='4kLine'
                onClick={noop}
                onRemoveClick={noop}
                label='Label'
                disabled
              />
            </ReqoreTagGroup>
          </ReqoreControlGroup>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-tag-remove').length).toBe(0);
});

test('Fires onClick and onRemoveClick <Tag /> events', () => {
  const clickFn = vi.fn();
  const removeClickFn = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreControlGroup minimal>
            <ReqoreTagGroup>
              <ReqoreTag
                icon='24HoursLine'
                rightIcon='4kLine'
                label='Test'
                onClick={clickFn}
                onRemoveClick={removeClickFn}
              />
            </ReqoreTagGroup>
          </ReqoreControlGroup>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-tag-content'));

  expect(clickFn).toHaveBeenCalledTimes(1);
  expect(removeClickFn).not.toHaveBeenCalled();

  fireEvent.click(document.querySelector('.reqore-tag-remove'));

  expect(clickFn).toHaveBeenCalledTimes(1);
  expect(removeClickFn).toHaveBeenCalledTimes(1);
});

test('Renders <Tag /> with the label key', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreControlGroup minimal>
            <ReqoreTagGroup>
              <ReqoreTag icon='24HoursLine' rightIcon='4kLine' label='Label' labelKey='label key' />
            </ReqoreTagGroup>
          </ReqoreControlGroup>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // Get the label key by text from screen
  expect(screen.getByText('label key')).toBeTruthy();
});

test('Renders <Tag /> with a monospace font family from the effect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTag label='data.items[0].sku' effect={{ fontFamily: 'mono' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // The tag declares `font-family: system-ui` of its own, so this asserts the effect
  // actually wins the cascade — the reason ReqoreDataView had to reach for a
  // descendant override before this existed.
  const tag = document.querySelector('.reqore-tag');

  expect(getComputedStyle(tag).fontFamily).toContain('ui-monospace');
  expect(getComputedStyle(tag).fontFamily).not.toContain('system-ui');
});

test('Renders <Tag /> with its own font family when the effect asks for none', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTag label='Label' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(getComputedStyle(document.querySelector('.reqore-tag')).fontFamily).toContain(
    'system-ui'
  );
});

test('Renders <Tag /> raised, and not raised when it already has a border', () => {
  const { rerender } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTag label='Label' raised />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(getComputedStyle(document.querySelector('.reqore-tag')).boxShadow).toContain('inset');

  // `flat={false}` draws a real border, and the inset highlight is a second way of
  // drawing the same edge — the guard every other RaisedElement consumer applies.
  rerender(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTag label='Label' raised flat={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(getComputedStyle(document.querySelector('.reqore-tag')).boxShadow).not.toContain('inset');
});

test('Renders <Tag /> with configurable vertical padding', () => {
  const { rerender } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTag label='Label' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // The default reproduces the 4px the tag hardcoded before this was configurable, so
  // no existing consumer moves.
  const content = () => document.querySelector('.reqore-tag-content > *') as HTMLElement;

  expect(getComputedStyle(content()).paddingTop).toBe('4px');
  expect(getComputedStyle(content()).paddingBottom).toBe('4px');

  rerender(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTag label='Label' paddingSize='micro' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(getComputedStyle(content()).paddingTop).toBe('0px');
});

test('Renders <Tag /> aligned to the text baseline on request', () => {
  const { rerender } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTag label='Label' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(getComputedStyle(document.querySelector('.reqore-tag')).verticalAlign).toBe('middle');

  rerender(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTag label='Label' verticalAlign='baseline' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(getComputedStyle(document.querySelector('.reqore-tag')).verticalAlign).toBe('baseline');
});

const renderTag = (props: Record<string, unknown>) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTag {...props} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const tag = () => document.querySelector('.reqore-tag') as HTMLElement;
const tagContent = () => document.querySelector('.reqore-tag-content') as HTMLElement;
const tagLabel = () => document.querySelector('.reqore-tag-label') as HTMLElement;

test('Renders <Tag /> capped at maxWidth', () => {
  renderTag({ label: 'https://host/webhooks/paddle-notifications', maxWidth: '20ch' });

  expect(getComputedStyle(tag()).maxWidth).toBe('20ch');
});

test('Renders <Tag /> label in its own box so it can ellipsize', () => {
  // text-overflow needs a block box. The label used to be an anonymous flex item of
  // StyledTagContent, which cannot take it — the tag clipped instead of ellipsizing.
  renderTag({ label: 'a-very-long-label-that-will-not-fit', maxWidth: '10ch' });

  const label = tagLabel();

  expect(label).toBeTruthy();
  expect(label.textContent).toBe('a-very-long-label-that-will-not-fit');
  expect(getComputedStyle(label).textOverflow).toBe('ellipsis');
  expect(getComputedStyle(label).overflow).toBe('hidden');
  expect(getComputedStyle(label).whiteSpace).toBe('nowrap');
});

test('Lets a capped <Tag /> shrink below its label', () => {
  // Both halves of the flexbox fix: the wrapper refuses to shrink by default, and a
  // flex item's min-width:auto keeps it at its content width even when it can.
  // Without either, the tag's overflow:hidden clips the CENTRED label at both ends.
  renderTag({ label: 'a-very-long-label-that-will-not-fit', maxWidth: '10ch' });

  const content = getComputedStyle(tagContent());

  expect(content.flexShrink).toBe('1');
  expect(content.minWidth).toBe('0px');
  expect(content.justifyContent).toBe('flex-start');
});

test('Leaves an uncapped <Tag /> exactly as it was', () => {
  // The default must not change: every existing tag keeps the same DOM and the same
  // no-shrink wrapper, so nothing that relies on a tag sizing to its label moves.
  renderTag({ label: 'a-very-long-label-that-will-not-fit' });

  expect(tagLabel()).toBeNull();
  expect(getComputedStyle(tagContent()).flexShrink).toBe('0');
  expect(getComputedStyle(tag()).maxWidth).toBe('100%');
});

test('Does not truncate a <Tag /> that wraps or has a fixed width', () => {
  // `wrap` asks for more lines rather than fewer characters, and `width` has already
  // fixed the box; honouring a cap as well would mean guessing which the caller meant.
  const { rerender } = renderTag({ label: 'long label here', maxWidth: '10ch', wrap: true });

  expect(tagLabel()).toBeNull();

  rerender(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTag label='long label here' maxWidth='10ch' width='300px' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(tagLabel()).toBeNull();
});

test('Keeps a capped <Tag /> label key whole', () => {
  // The key is the part a reader cannot reconstruct: a truncated "POST" says nothing,
  // while a shortened URL still shows what kind of thing it is.
  renderTag({ labelKey: 'POST', label: 'https://host/webhooks/x', maxWidth: '16ch' });

  const key = document.querySelector('.reqore-tag-key-content') as HTMLElement;

  expect(key.textContent).toBe('POST');
  expect(getComputedStyle(key).flexShrink).toBe('0');
});

test('Drops the middle of a capped <Tag /> label on request', () => {
  // Values that share a prefix and differ at the end — URLs on one host, ids in one
  // namespace — all render identically when the tail is what goes.
  renderTag({
    label: 'https://host/webhooks/paddle-notifications',
    maxWidth: '20ch',
    truncate: 'middle',
  });

  const head = document.querySelector('.reqore-tag-label-head') as HTMLElement;
  const tail = document.querySelector('.reqore-tag-label-tail') as HTMLElement;

  expect(head).toBeTruthy();
  expect(tail).toBeTruthy();

  // The whole value is still in the DOM, in order: the tag stays copyable, findable
  // and readable in full. A JS shortener deletes the characters it hides.
  expect(`${head.textContent}${tail.textContent}`).toBe(
    'https://host/webhooks/paddle-notifications'
  );

  // The head ellipsizes; the tail is the part that is kept, so it never shrinks.
  expect(getComputedStyle(head).textOverflow).toBe('ellipsis');
  expect(getComputedStyle(head).minWidth).toBe('0px');
  expect(getComputedStyle(tail).flexShrink).toBe('0');
});

test('Splits a middle-truncated <Tag /> label at the last third', () => {
  renderTag({ label: '123456789012', maxWidth: '6ch', truncate: 'middle' });

  expect(document.querySelector('.reqore-tag-label-head').textContent).toBe('12345678');
  expect(document.querySelector('.reqore-tag-label-tail').textContent).toBe('9012');
});

test('Keeps a middle-truncated <Tag /> label whole when there is no third to drop', () => {
  // Two characters have no meaningful halves; pinning one of them would put an
  // ellipsis in the middle of a value that fits.
  renderTag({ label: 'ab', maxWidth: '20ch', truncate: 'middle' });

  expect(document.querySelector('.reqore-tag-label-head').textContent).toBe('ab');
  expect(document.querySelector('.reqore-tag-label-tail').textContent).toBe('');
});

test('Truncates a <Tag /> at the end by default', () => {
  renderTag({ label: 'https://host/webhooks/paddle-notifications', maxWidth: '20ch' });

  expect(document.querySelector('.reqore-tag-label')).toBeTruthy();
  expect(document.querySelector('.reqore-tag-label-head')).toBeNull();
});

test('Ignores truncate on an uncapped <Tag />', () => {
  // There is nothing to drop until the label is capped, so the label must not be
  // split into two elements for no reason.
  renderTag({ label: 'https://host/webhooks/paddle-notifications', truncate: 'middle' });

  expect(document.querySelector('.reqore-tag-label')).toBeNull();
  expect(document.querySelector('.reqore-tag-label-head')).toBeNull();
});

test('Does not split a numeric <Tag /> label', () => {
  // A number has no head and tail worth telling apart, and Array.from would have to
  // be handed a string anyway.
  renderTag({ label: 1234567890, maxWidth: '4ch', truncate: 'middle' });

  expect(document.querySelector('.reqore-tag-label-head')).toBeNull();
  expect(document.querySelector('.reqore-tag-label').textContent).toBe('1234567890');
});

test('Splits a middle-truncated <Tag /> label even when it fits', () => {
  // CSS cannot know whether the label overflows without measuring, which is the whole
  // point of doing this in CSS — so the split is unconditional. The rendered text is
  // unchanged; only the node boundary is new, and a consumer querying by text has to
  // match across it.
  renderTag({ label: 'short', maxWidth: '40ch', truncate: 'middle' });

  const label = document.querySelector('.reqore-tag-label') as HTMLElement;

  expect(label.textContent).toBe('short');
  expect(document.querySelector('.reqore-tag-label-head')).toBeTruthy();
});

test('Gives a capped <Tag /> label the room its key does not need', () => {
  // A key normally grows to share the tag with the label, which is right when the tag
  // sizes to its content. Under a cap it starved the label: the key took half the
  // width to render four characters, and the tail — which is not allowed to shrink —
  // ran out past the tag's edge, leaving a hole where the key's unused half was.
  renderTag({
    labelKey: 'POST',
    label: 'https://host:8011/webhooks/paddle-notifications',
    maxWidth: '30ch',
    truncate: 'middle',
  });

  expect(getComputedStyle(document.querySelector('.reqore-tag-key-content')).flexGrow).toBe('0');
});

test('Still splits an uncapped key/value <Tag /> evenly', () => {
  // The even split is the whole point of a key/value tag; only a cap changes it.
  renderTag({ labelKey: 'Key', label: 'value' });

  expect(getComputedStyle(document.querySelector('.reqore-tag-key-content')).flexGrow).toBe('1');
});
