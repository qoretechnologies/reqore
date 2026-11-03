import { StoryObj } from '@storybook/react';
import { expect, fn, screen } from 'storybook/test';
import { _testsClickButton, _testsWaitForText } from '../../../__tests__/utils';
import { ReqoreExportModal } from '../../components/ExportModal';
import { tableData } from '../../mock/tableData';
import { StoryMeta } from '../utils';
import { withBrowserThatCannotCopy } from '../utils/clipboard';

const meta = {
  title: 'Utilities/Export Modal',
  component: ReqoreExportModal,
} as StoryMeta<typeof ReqoreExportModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ExportModal in its default configuration.',
      },
    },
  },
  args: {
    data: tableData,
  },
};

export const CopyFailed: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders ExportModal in a browser that allows no copy (the Clipboard API refuses and the copy command copies nothing), and presses "Copy and close": a red "Could not copy" notification says the browser did not allow it and to select the text and copy it by hand, and the modal stays open with the data in it so that can be done. No "copied" confirmation is shown.',
      },
    },
  },
  args: {
    data: tableData,
    onClose: fn(),
  },
  beforeEach: () => withBrowserThatCannotCopy(),
  play: async ({ args }) => {
    await _testsClickButton({ label: 'Copy and close' });
    await _testsWaitForText('Could not copy');
    await _testsWaitForText(
      'The browser did not allow copying to the clipboard. Select the text and copy it yourself.'
    );
    await expect(screen.queryByText('Data copied to clipboard')).toBeNull();
    await expect(args.onClose).not.toHaveBeenCalled();
    await expect(document.querySelector('.reqore-modal')).toBeInTheDocument();
  },
};
