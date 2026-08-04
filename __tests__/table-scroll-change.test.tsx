import { fireEvent, render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreTable, ReqoreUIProvider } from '../src';
import tableData from '../src/mock/tableData';

test('<Table /> onScrollChange reports true when scrolled from the top and false at the top', () => {
  const onScrollChange = vi.fn();

  const { container } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTable {...tableData} height={200} onScrollChange={onScrollChange} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const body = container.querySelector('.reqore-table-body') as HTMLElement;
  expect(body).toBeInTheDocument();

  // Scrolling down from the top surfaces `true` so a host can collapse its chrome.
  Object.defineProperty(body, 'scrollTop', { value: 120, configurable: true });
  fireEvent.scroll(body);
  expect(onScrollChange).toHaveBeenLastCalledWith(true);

  // Returning to the top surfaces `false` — this is what drives restore-at-top.
  Object.defineProperty(body, 'scrollTop', { value: 0, configurable: true });
  fireEvent.scroll(body);
  expect(onScrollChange).toHaveBeenLastCalledWith(false);
});
