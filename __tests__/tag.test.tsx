import { fireEvent, render } from '@testing-library/react';
import { noop } from 'lodash';
import React from 'react';
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
            <ReqoreTag
              icon='24HoursLine'
              rightIcon='4KLine'
              onClick={noop}
              onRemoveClick={noop}
            />
            <ReqoreTag
              icon='24HoursLine'
              rightIcon='4KLine'
              onClick={noop}
              onRemoveClick={noop}
              size='big'
            />
            <ReqoreTag
              icon='24HoursLine'
              rightIcon='4KLine'
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

test('Renders <Tag /> group properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreControlGroup minimal>
            <ReqoreTagGroup>
              <ReqoreTag
                icon='24HoursLine'
                rightIcon='4KLine'
                onClick={noop}
                onRemoveClick={noop}
                label='Label'
              />
              <ReqoreTag
                icon='24HoursLine'
                rightIcon='4KLine'
                onClick={noop}
                onRemoveClick={noop}
                size='big'
              />
              <ReqoreTag
                icon='24HoursLine'
                rightIcon='4KLine'
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
                rightIcon='4KLine'
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
  const clickFn = jest.fn();
  const removeClickFn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreControlGroup minimal>
            <ReqoreTagGroup>
              <ReqoreTag
                icon='24HoursLine'
                rightIcon='4KLine'
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
