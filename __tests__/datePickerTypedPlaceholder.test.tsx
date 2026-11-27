import { render } from '@testing-library/react';
import { DatePicker, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

/*
 * An empty date picker that takes typing drew its segments' template ("yyyy - mm - dd") as if it were a date
 * already given; `placeholder` reached only the button of a `selectOnly` picker. The field that takes typing now
 * carries the placeholder (`data-placeholder-text`), which its style draws in place of the segments while it is
 * empty and not focused (`Form/DatePicker › An Empty Typed Picker Says Its Placeholder`: jsdom cannot evaluate the
 * rule, a browser can).
 */
const renderPicker = (props: Partial<React.ComponentProps<typeof DatePicker>>) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <DatePicker value={null} onChange={vi.fn()} locale='en-US' {...props} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

/** The field that takes typing: the group the date's segments are in. */
const typedField = (): HTMLElement | null =>
  document.querySelector<HTMLElement>('[data-type="year"]')?.parentElement ?? null;

test('the field that takes typing carries its placeholder', () => {
  renderPicker({ placeholder: 'Pick a day', granularity: 'day' });

  expect(typedField()?.getAttribute('data-placeholder-text')).toBe('Pick a day');
});

test('a picker with no placeholder keeps its segments', () => {
  renderPicker({ granularity: 'day' });

  expect(typedField()?.hasAttribute('data-placeholder-text')).toBe(false);
});

test('a picker that only opens its calendar says its placeholder on its button, as before', () => {
  const { getAllByText } = renderPicker({ placeholder: 'Pick a day', selectOnly: true });

  expect(getAllByText('Pick a day').length).toBeGreaterThan(0);
  expect(document.querySelector('[data-placeholder-text]')).toBeNull();
});
