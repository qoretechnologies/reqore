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
