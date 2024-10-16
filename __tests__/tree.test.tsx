import { fireEvent, render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreTree, ReqoreUIProvider } from '../src';
import MockObject from '../src/mock/object.json';

test('Renders basic <Tree /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTree data={MockObject} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-tree-toggle').length).toBe(8);
});

test('<Tree /> items can be expanded and collapsed', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTree data={MockObject} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-tree-toggle'));

  expect(document.querySelectorAll('.reqore-tree-label').length).toBe(20);

  fireEvent.click(document.querySelector('.reqore-tree-toggle'));

  expect(document.querySelectorAll('.reqore-tree-label').length).toBe(0);
});

test('Renders <Tree /> with clickable items', () => {
  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTree data={MockObject} onItemClick={fn} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-tree-toggle'));
  fireEvent.click(document.querySelectorAll('.reqore-tree-toggle')[2]);
  fireEvent.click(document.querySelectorAll('.reqore-tree-toggle')[4]);
  fireEvent.click(document.querySelectorAll('.reqore-tree-label')[19]);

  expect(fn).toHaveBeenCalledWith('Rose Farmer', ['0', 'friends', '1', 'name']);
});
