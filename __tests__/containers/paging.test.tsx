import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import {
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreLayoutContent,
  ReqorePaginationContainer,
  ReqoreTag,
  ReqoreUIProvider,
} from '../../src';
import { tableData as data } from '../../src/mock/tableData';

test('Renders default <PaginationContainer />', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqorePaginationContainer<any> items={data} type='buttons'>
            {(items) => (
              <ReqoreControlGroup vertical>
                {items.map((item) => (
                  <ReqoreTag label={`${item.firstName} ${item.lastName}`} />
                ))}
              </ReqoreControlGroup>
            )}
          </ReqorePaginationContainer>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-pagination-wrapper').length).toBe(1);
  expect(document.querySelectorAll('.reqore-button')[0]?.getAttribute('disabled')).toBe('');
  expect(document.querySelectorAll('.reqore-button').length).toBe(102);

  fireEvent.click(document.querySelectorAll('.reqore-button')[100]);

  expect(screen.getAllByText('Rodd Solly')).toBeTruthy();
  expect(document.querySelectorAll('.reqore-button')[101]?.getAttribute('disabled')).toBe('');
});

test('Renders default <PaginationContainer /> with both control wrappers', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqorePaginationContainer<any> items={data} type={{ pageControlsPosition: 'both' }}>
            {(items) => (
              <ReqoreControlGroup vertical>
                {items.map((item) => (
                  <ReqoreTag label={`${item.firstName} ${item.lastName}`} />
                ))}
              </ReqoreControlGroup>
            )}
          </ReqorePaginationContainer>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-pagination-wrapper').length).toBe(2);
  expect(document.querySelectorAll('.reqore-button')[0]?.getAttribute('disabled')).toBe('');
  expect(document.querySelectorAll('.reqore-button').length).toBe(204);

  fireEvent.click(document.querySelectorAll('.reqore-button')[100]);

  expect(screen.getAllByText('Rodd Solly')).toBeTruthy();

  expect(document.querySelectorAll('.reqore-button')[101]?.getAttribute('disabled')).toBe('');
  expect(document.querySelectorAll('.reqore-button')[203]?.getAttribute('disabled')).toBe('');
});

test('Renders default <PaginationContainer /> with both control wrappers, one included in children', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqorePaginationContainer<any>
            items={data}
            type={{ pageControlsPosition: 'both', includeBottomControls: false }}
          >
            {(items, Controls, { includeBottomControls }) => (
              <ReqoreControlGroup vertical>
                {items.map((item) => (
                  <ReqoreTag label={`${item.firstName} ${item.lastName}`} />
                ))}
                {!includeBottomControls && Controls}
              </ReqoreControlGroup>
            )}
          </ReqorePaginationContainer>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-pagination-wrapper').length).toBe(2);
  expect(document.querySelectorAll('.reqore-button')[0]?.getAttribute('disabled')).toBe('');
  expect(document.querySelectorAll('.reqore-button').length).toBe(204);

  fireEvent.click(document.querySelectorAll('.reqore-button')[100]);

  expect(screen.getAllByText('Rodd Solly')).toBeTruthy();

  expect(document.querySelectorAll('.reqore-button')[101]?.getAttribute('disabled')).toBe('');
  expect(document.querySelectorAll('.reqore-button')[203]?.getAttribute('disabled')).toBe('');
});

test('Renders default <PaginationContainer /> with onPageChange callback', () => {
  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqorePaginationContainer<any>
            items={data}
            type={{ onPageChange: fn, infinite: true }}
          >
            {(items) => (
              <ReqoreControlGroup vertical>
                {items.map((item) => (
                  <ReqoreTag label={`${item.firstName} ${item.lastName}`} />
                ))}
              </ReqoreControlGroup>
            )}
          </ReqorePaginationContainer>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-pagination-wrapper').length).toBe(1);

  fireEvent.click(document.querySelectorAll('.reqore-button')[0]);

  expect(fn).toBeCalledTimes(1);
  expect(fn).toBeCalledWith(2, { isFirst: false, isLast: false });
});
