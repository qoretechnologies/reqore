import { expect, fireEvent, fn, screen } from 'storybook/test';
import { StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { _testsClickButton, _testsWaitForText } from '../../../__tests__/utils';
import ReqoreButton from '../../components/Button';
import { ReqoreErrorBoundary } from '../../components/ErrorBoundary';
import { StoryMeta } from '../utils';
import { expectedError } from '../utils/expectedConsole';

const ThrowsError = () => {
  const [error, setError] = useState(false);

  useEffect(() => {
    if (error) {
      throw new Error('This is a test error');
    }
  }, [error]);

  return <ReqoreButton onClick={() => setError(true)}>Throw error</ReqoreButton>;
};

/**
 * Presses one of the fallback's actions by its name: on a narrow screen its panel draws them as icons, named by their
 * labels (`aria-label`), so the words are not on screen.
 */
const pressAction = async (name: 'Details' | 'Reset') =>
  fireEvent.click(await screen.findByRole('button', { name }));

/**
 * The errors a story gives when ThrowsError throws, each once: React, in development, reports the error it hands to
 * the boundary to the window as uncaught too, and the boundary logs what it caught, as it does in production.
 */
const THROWN = expectedError({
  uncaught: /^This is a test error$/,
  logged: [/^ReqoreErrorBoundary caught an error: Error: This is a test error/],
});

const meta = {
  title: 'Utilities/Error Boundary',
  component: ReqoreErrorBoundary,
  args: {
    onError: fn(),
  },
} as StoryMeta<typeof ReqoreErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ErrorBoundary in its default configuration.',
      },
    },
  },
  args: {
    children: 'This component does not throw any error',
  },
};

export const Throws: Story = {
  parameters: {
    ...THROWN.parameters,
    docs: {
      description: {
        story:
          'Renders ErrorBoundary in a mode that throws — used to exercise the error boundary.',
      },
    },
  },
  args: {
    children: <ThrowsError />,
    doNotCatch: false,
  },
  beforeEach: THROWN.beforeEach,
  play: async ({ args }) => {
    await _testsClickButton({ label: 'Throw error' });
    await _testsWaitForText('Something went wrong');

    await expect(args.onError).toHaveBeenCalled();
    await THROWN.expectErrored();
  },
};

export const ShowDetails: Story = {
  ...Throws,
  parameters: {
    ...THROWN.parameters,
    docs: {
      description: {
        story:
          'Renders ErrorBoundary with the details view visible.',
      },
    },
  },
  play: async (args) => {
    await Throws.play(args);
    await pressAction('Details');
    await _testsWaitForText('"This is a test error"');
  },
};

export const WithCustomMessage: Story = {
  parameters: {
    ...THROWN.parameters,
    docs: {
      description: {
        story:
          'Renders ErrorBoundary with a custom message rendered inside.',
      },
    },
  },
  args: {
    children: <ThrowsError />,
    errorMessage: 'Ooooopsie doopsie, something went wrong!',
  },
  beforeEach: THROWN.beforeEach,
  play: async ({ args }) => {
    await _testsClickButton({ label: 'Throw error' });
    await _testsWaitForText('Ooooopsie doopsie, something went wrong!');

    await expect(args.onError).toHaveBeenCalled();
    await THROWN.expectErrored();
  },
};

export const WithCustomGlobalMessage: Story = {
  parameters: {
    ...THROWN.parameters,
    docs: {
      description: {
        story:
          'Renders ErrorBoundary with a custom global message.',
      },
    },
  },
  args: {
    children: <ThrowsError />,
    options: {
      errorBoundaryOptions: {
        errorMessage: 'Ha! You thought you could break me! And you did! :D',
      },
    },
  },
  beforeEach: THROWN.beforeEach,
  play: async ({ args }) => {
    await _testsClickButton({ label: 'Throw error' });
    await _testsWaitForText('Ha! You thought you could break me! And you did! :D');

    await expect(args.onError).toHaveBeenCalled();
    await THROWN.expectErrored();
  },
};

export const Resets: Story = {
  ...Throws,
  parameters: {
    ...THROWN.parameters,
    docs: {
      description: {
        story:
          'Renders ErrorBoundary and exercises its reset flow.',
      },
    },
  },
  play: async (args) => {
    await Throws.play(args);

    await pressAction('Reset');
    await _testsWaitForText('Throw error');
  },
};
