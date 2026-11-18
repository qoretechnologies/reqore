/**
 * A panel's title shows the label it is given in the same render, so whatever measures the title right after that
 * render (the panel's own fit: its room, the line its badges go to) measures the words the reader sees.
 *
 * The title copied its label into state by an effect, so for one render it still showed the old words. A drawer whose
 * name arrived with its data was measured as "A/B test" beside its badge and fitted its long name to the room left
 * beside the badge: one line at 14px where two lines at 20px fitted (the admin portal's ExperimentDrawer › Removed
 * Version; story `Dialogs/Drawer · The Same Title At The Same Size Beside A Long Word`).
 */
import { act, fireEvent, render } from '@testing-library/react';
import { useLayoutEffect, useState } from 'react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import { LabelEditor } from '../src/components/Panel/LabelEditor';

/** The title's text as each render's layout effects see it. */
const seen: string[] = [];

const Measured = ({ label, onSubmit }: { label: string; onSubmit?: (label: string | number) => void }) => {
  useLayoutEffect(() => {
    seen.push(document.querySelector('.reqore-label-editor')?.textContent ?? '');
  }, [label]);

  return <LabelEditor label={label} onSubmit={onSubmit} />;
};

const renderTitle = (props: { label: string; onSubmit?: (label: string | number) => void }) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Measured {...props} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

beforeEach(() => {
  seen.length = 0;
});

test('a new label is drawn in the render that brings it', () => {
  const { rerender } = renderTitle({ label: 'A/B test' });

  rerender(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Measured label='Hero: Qonsole input vs problem wizard' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(seen).toEqual(['A/B test', 'Hero: Qonsole input vs problem wizard']);
});

test('an editable title still starts its draft from the label it shows', () => {
  const submitted: Array<string | number> = [];
  const Owner = () => {
    const [label, setLabel] = useState('Order sync');

    return (
      <Measured
        label={label}
        onSubmit={(next) => {
          submitted.push(next);
          setLabel(String(next));
        }}
      />
    );
  };

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Owner />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-label-editor')!);

  const input = document.querySelector('input') as HTMLInputElement;

  expect(input.value).toBe('Order sync');
  fireEvent.change(input, { target: { value: 'Order sync v2' } });
  act(() => {
    fireEvent.blur(input);
  });

  expect(submitted).toEqual(['Order sync v2']);
  expect(document.querySelector('.reqore-label-editor')?.textContent).toBe('Order sync v2');
});
