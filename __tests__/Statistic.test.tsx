import { fireEvent, render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreStatistic,
  ReqoreUIProvider,
} from '../src';

test('Renders <Statistic /> with value', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={12345} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-statistic').length).toBe(1);
  expect(document.querySelector('.reqore-statistic-value')!.textContent).toBe('12345');
});

test('Renders <Statistic /> with string value', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value="$12,345" />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-statistic-value')!.textContent).toBe('$12,345');
});

test('Renders <Statistic /> with label', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={100} label="Total Users" />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-statistic-label')!.textContent).toBe('Total Users');
});

test('Does not render label when not provided', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={100} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-statistic-label').length).toBe(0);
});

test('Renders <Statistic /> with icon', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={100} icon="UserLine" />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-statistic-icon').length).toBe(1);
});

test('Renders <Statistic /> with prefix and suffix', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value="1,200" prefix="$" suffix=" USD" />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-statistic-prefix')!.textContent).toBe('$');
  expect(document.querySelector('.reqore-statistic-suffix')!.textContent).toBe(' USD');
});

test('Does not render prefix/suffix when not provided', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={100} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-statistic-prefix').length).toBe(0);
  expect(document.querySelectorAll('.reqore-statistic-suffix').length).toBe(0);
});

test('Renders <Statistic /> with trend up', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={100} trend={{ direction: 'up', value: '+12%' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const trend = document.querySelector('.reqore-statistic-trend');
  expect(trend).toBeTruthy();
  expect(trend!.querySelectorAll('.reqore-icon').length).toBe(1);
  expect(trend!.textContent).toContain('+12%');
});

test('Renders <Statistic /> with trend down', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={100} trend={{ direction: 'down', value: '-5%' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const trend = document.querySelector('.reqore-statistic-trend');
  expect(trend).toBeTruthy();
  expect(trend!.textContent).toContain('-5%');
});

test('Renders <Statistic /> with trend neutral', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={100} trend={{ direction: 'neutral' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-statistic-trend').length).toBe(1);
});

test('Does not render trend when not provided', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={100} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-statistic-trend').length).toBe(0);
});

test('Renders <Statistic /> with different sizes', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={1} size="tiny" />
          <ReqoreStatistic value={2} size="small" />
          <ReqoreStatistic value={3} size="normal" />
          <ReqoreStatistic value={4} size="big" />
          <ReqoreStatistic value={5} size="huge" />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-statistic').length).toBe(5);
});

test('Renders <Statistic /> with intents', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={1} intent="info" />
          <ReqoreStatistic value={2} intent="success" />
          <ReqoreStatistic value={3} intent="warning" />
          <ReqoreStatistic value={4} intent="danger" />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-statistic').length).toBe(4);
});

test('Renders <Statistic /> disabled', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={100} disabled />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-statistic').length).toBe(1);
});

test('Renders <Statistic /> with vertical layout', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={100} label="Users" icon="UserLine" />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-statistic').length).toBe(1);
  expect(document.querySelectorAll('.reqore-statistic-icon').length).toBe(1);
  expect(document.querySelectorAll('.reqore-statistic-label').length).toBe(1);
});

test('Renders <Statistic /> with fluid width', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={100} fluid />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-statistic').length).toBe(1);
});

test('Renders <Statistic /> with rounded background', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={100} label="Users" rounded />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-statistic').length).toBe(1);
  expect(document.querySelector('.reqore-statistic-label')!.textContent).toBe('Users');
});

test('Renders <Statistic /> with background effect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic
            value={100}
            rounded
            effect={{
              gradient: {
                colors: { 0: 'info', 100: 'success' },
              },
            }}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-statistic').length).toBe(1);
});

test('Renders <Statistic /> with flat background', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={100} rounded flat />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-statistic').length).toBe(1);
});

test('Renders <Statistic /> as interactive when onClick is provided', () => {
  const handleClick = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={100} label="Clickable" onClick={handleClick} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const statistic = document.querySelector('.reqore-statistic')!;
  fireEvent.click(statistic);
  expect(handleClick).toHaveBeenCalledTimes(1);
});


test('Renders <Statistic /> with raised effect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreStatistic value={100} label='Raised' rounded raised />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-statistic').length).toBe(1);
});
