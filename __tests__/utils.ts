import { expect } from '@storybook/jest';
import { fireEvent, screen, waitFor } from '@storybook/testing-library';

export async function _testsClickButton({
  label,
  selector,
  nth = 0,
  wait = 7000,
  parent = '.reqore-button',
}: {
  label?: string;
  selector?: string;
  nth?: number;
  wait?: number;
  parent?: string;
}) {
  if (!label) {
    await waitFor(() => expect(document.querySelectorAll(selector)[nth]).toBeInTheDocument(), {
      timeout: wait,
    });
    await fireEvent.click(document.querySelectorAll(selector)[nth]);
  } else {
    await waitFor(
      () => expect(screen.queryAllByText(label, { selector })[nth]).toBeInTheDocument(),
      { timeout: wait }
    );
    await waitFor(
      () => expect(screen.queryAllByText(label, { selector })[nth].closest(parent)).toBeEnabled(),
      { timeout: wait }
    );
    await fireEvent.click(screen.queryAllByText(label, { selector })[nth]);
  }
}

export async function _testsClickNonButton({
  label,
  selector,
  nth = 0,
  wait = 7000,
}: {
  label?: string;
  selector?: string;
  nth?: number;
  wait?: number;
  parent?: string;
}) {
  if (!label) {
    await waitFor(() => expect(document.querySelectorAll(selector)[nth]).toBeInTheDocument(), {
      timeout: wait,
    });
    await fireEvent.click(document.querySelectorAll(selector)[nth]);
  } else {
    await waitFor(
      () => expect(screen.queryAllByText(label, { selector })[nth]).toBeInTheDocument(),
      { timeout: wait }
    );

    await fireEvent.click(screen.queryAllByText(label, { selector })[nth]);
  }
}

export async function _testsWaitForText(text: string, selector?: string) {
  await waitFor(() => expect(screen.queryAllByText(text, { selector })[0]).toBeInTheDocument(), {
    timeout: 10000,
  });
}
