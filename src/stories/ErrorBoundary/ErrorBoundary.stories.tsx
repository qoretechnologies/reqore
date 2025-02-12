import { expect, jest } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { _testsClickButton, _testsWaitForText } from '../../../__tests__/utils';
import ReqoreButton from '../../components/Button';
import { ReqoreErrorBoundary } from '../../components/ErrorBoundary';
import { StoryMeta } from '../utils';

const ThrowsError = () => {
  const [error, setError] = useState(false);

  useEffect(() => {
    if (error) {
      throw new Error('This is a test error');
    }
  }, [error]);

  return <ReqoreButton onClick={() => setError(true)}>Throw error</ReqoreButton>;
};

const meta = {
  title: 'Utilities/Error Boundary',
  component: ReqoreErrorBoundary,
  args: {
    onError: jest.fn(),
  },
} as StoryMeta<typeof ReqoreErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This component does not throw any error',
  },
};

export const Throws: Story = {
  args: {
    children: <ThrowsError />,
    doNotCatch: false,
  },
  play: async ({ args }) => {
    await _testsClickButton({ label: 'Throw error' });
    await _testsWaitForText('Something went wrong');

    expect(args.onError).toHaveBeenCalled();
  },
};

export const ShowDetails: Story = {
  ...Throws,
  play: async (args) => {
    await Throws.play(args);
    await _testsClickButton({ label: 'Details' });
    await _testsWaitForText('"This is a test error"');
  },
};

export const WithCustomMessage: Story = {
  args: {
    children: <ThrowsError />,
    errorMessage: 'Ooooopsie doopsie, something went wrong!',
  },
  play: async ({ args }) => {
    await _testsClickButton({ label: 'Throw error' });
    await _testsWaitForText('Ooooopsie doopsie, something went wrong!');

    expect(args.onError).toHaveBeenCalled();
  },
};

export const WithCustomGlobalMessage: Story = {
  args: {
    children: <ThrowsError />,
    options: {
      errorBoundaryOptions: {
        errorMessage: 'Ha! You thought you could break me! And you did! :D',
      },
    },
  },
  play: async ({ args }) => {
    await _testsClickButton({ label: 'Throw error' });
    await _testsWaitForText('Ha! You thought you could break me! And you did! :D');

    expect(args.onError).toHaveBeenCalled();
  },
};

export const Resets: Story = {
  ...Throws,
  play: async (args) => {
    await Throws.play(args);

    await _testsClickButton({ label: 'Reset' });
    await _testsWaitForText('Throw error');
  },
};
