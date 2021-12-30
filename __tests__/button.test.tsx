import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { ReqoreButton, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

test('Renders <Button /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreButton minimal>Hello</ReqoreButton>
          <ReqoreButton icon='4KFill'>Another</ReqoreButton>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-icon').length).toBe(1);
  expect(document.querySelectorAll('.reqore-button').length).toBe(2);
});

test('Renders <Button /> with size properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreButton size='tiny'>Tiny</ReqoreButton>
          <ReqoreButton size='small'>Small</ReqoreButton>
          <ReqoreButton size='big'>Big</ReqoreButton>
          <ReqoreButton size='huge'>Huge</ReqoreButton>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-button').length).toBe(4);
});

test('Renders <Button /> with icon properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreButton icon='4KFill'>4K</ReqoreButton>
          <ReqoreButton icon='24HoursFill'>24</ReqoreButton>
          <ReqoreButton icon='BallPenFill'>Pen</ReqoreButton>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-icon').length).toBe(3);
  expect(document.querySelectorAll('.reqore-button').length).toBe(3);
});

test('Renders <Button /> with intent properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreButton intent='pending'>Pending</ReqoreButton>
          <ReqoreButton intent='info'>Info</ReqoreButton>
          <ReqoreButton intent='success'>Success</ReqoreButton>
          <ReqoreButton intent='warning'>Warning</ReqoreButton>
          <ReqoreButton intent='danger'>Danger</ReqoreButton>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-button').length).toBe(5);
});

test('Renders <Button /> with right icon properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreButton rightIcon='4KFill'>4K</ReqoreButton>
          <ReqoreButton rightIcon='24HoursFill'>24</ReqoreButton>
          <ReqoreButton rightIcon='BallPenFill'>Pen</ReqoreButton>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-button').length).toBe(3);
});

test('Renders <Button /> with icon and right icon properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreButton icon='4KFill' rightIcon='24HoursFill'>
            4K
          </ReqoreButton>
          <ReqoreButton icon='24HoursFill' rightIcon='BallPenFill'>
            24
          </ReqoreButton>
          <ReqoreButton icon='BallPenFill' rightIcon='4KFill'>
            Pen
          </ReqoreButton>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-button').length).toBe(3);
});

// A test that tests the onClick function of the button using fireEvent
test('Renders <Button /> with onClick function', () => {
  const onClick = jest.fn();
  const { getAllByText } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreButton onClick={onClick}>Click</ReqoreButton>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(getAllByText('Click')[0]);
  expect(onClick).toHaveBeenCalledTimes(1);
});
