import { Meta, Story } from '@storybook/react';
import { IReqoreColumnsProps } from '../../components/Columns';
import { ReqoreColumn, ReqoreColumns } from '../../index';
import { argManager } from '../utils/args';

export interface IColumnsStoryArgs extends IReqoreColumnsProps {
  multipleColumns?: boolean;
}

const { createArg, disableArgs } = argManager<IColumnsStoryArgs>();

export default {
  title: 'Components/Columns',
  component: ReqoreColumns,
  argTypes: {
    ...createArg('multipleColumns', {
      defaultValue: false,
      control: 'boolean',
      name: 'Multiple Columns',
    }),
    ...createArg('minColumnWidth', {
      defaultValue: '200px',
    }),
    ...createArg('maxColumnWidth', {
      defaultValue: '300px',
    }),
    ...createArg('alignItems', {
      defaultValue: 'normal',
    }),
    ...createArg('alignItems', {
      defaultValue: 'normal',
    }),
    ...createArg('columns', {
      defaultValue: undefined,
      type: 'number',
    }),
    ...createArg('columnsGap', {
      defaultValue: undefined,
    }),
    ...disableArgs(['className', 'multipleColumns']),
  },
} as Meta<IColumnsStoryArgs>;

const Template: Story<IColumnsStoryArgs> = (args) => {
  return (
    <ReqoreColumns {...args}>
      <ReqoreColumn {...args} style={{ border: '1px solid white', padding: '10px' }}>
        1st column
      </ReqoreColumn>
      <ReqoreColumn {...args} style={{ border: '1px solid white', padding: '10px' }}>
        2nd column
      </ReqoreColumn>
      {args.multipleColumns && (
        <>
          <ReqoreColumn {...args} style={{ border: '1px solid white', padding: '10px' }}>
            4th column
          </ReqoreColumn>
          <ReqoreColumn {...args} style={{ border: '1px solid white', padding: '10px' }}>
            3rd column
          </ReqoreColumn>
        </>
      )}
    </ReqoreColumns>
  );
};

export const Basic = Template.bind({});
export const MultipleColumns = Template.bind({});
MultipleColumns.args = {
  multipleColumns: true,
};
