import { StoryObj } from '@storybook/react';
import { ReqoreExportModal } from '../../components/ExportModal';
import { tableData } from '../../mock/tableData';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Utilities/Export Modal/Stories',
  component: ReqoreExportModal,
} as StoryMeta<typeof ReqoreExportModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: tableData,
  },
};
