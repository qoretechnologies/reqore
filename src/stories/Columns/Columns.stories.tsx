import { Meta, Story } from '@storybook/react';
import { IReqoreColumnsProps } from '../../components/Columns';
import {
  ReqoreButton,
  ReqoreColumn,
  ReqoreColumns,
  ReqoreControlGroup,
  ReqoreH2,
  ReqoreInput,
  ReqoreVerticalSpacer,
} from '../../index';
import { argManager } from '../utils/args';

export interface IColumnsStoryArgs extends IReqoreColumnsProps {
  multipleColumns?: boolean;
}

const { createArg, disableArgs } = argManager<IColumnsStoryArgs>();

export default {
  title: 'Layout/Columns/Stories',
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
      type: 'string',
    }),
    ...createArg('columnsGap', {
      defaultValue: undefined,
    }),
    ...disableArgs(['className', 'multipleColumns']),
  },
} as Meta<IColumnsStoryArgs>;

const Template: Story<IColumnsStoryArgs> = (args) => {
  return (
    <ReqoreColumns {...args} columnsGap='10px'>
      <ReqoreColumn
        {...args}
        style={{ border: '1px solid white', padding: '10px' }}
        flexFlow='column'
      >
        <ReqoreH2>Left Column</ReqoreH2>
        <ReqoreVerticalSpacer height={20} lineSize='tiny' />
        <ReqoreControlGroup fluid>
          <ReqoreInput placeholder='Filter' />
        </ReqoreControlGroup>
        <ReqoreVerticalSpacer height={10} />
        <ReqoreControlGroup vertical fluid>
          <ReqoreButton description='This is a button'>Button</ReqoreButton>
          <ReqoreButton description='This is a button'>Button</ReqoreButton>
          <ReqoreButton description='This is a button'>Button</ReqoreButton>
          <ReqoreButton description='This is a button'>Button</ReqoreButton>
          <ReqoreButton description='This is a button'>Button</ReqoreButton>
          <ReqoreButton description='This is a button'>Button</ReqoreButton>
          <ReqoreButton description='This is a button'>Button</ReqoreButton>
        </ReqoreControlGroup>
      </ReqoreColumn>
      <ReqoreColumn
        {...args}
        style={{ border: '1px solid white', padding: '10px' }}
        flexFlow='column'
      >
        <ReqoreH2>Right Column</ReqoreH2>
        <ReqoreVerticalSpacer height={20} lineSize='tiny' />
        <ReqoreControlGroup fluid>
          <ReqoreInput placeholder='Filter' />
        </ReqoreControlGroup>
        <ReqoreVerticalSpacer height={10} />
        <ReqoreControlGroup vertical fluid>
          <ReqoreButton description='This is a button'>Button</ReqoreButton>
          <ReqoreButton description='This is a button'>Button</ReqoreButton>
        </ReqoreControlGroup>
      </ReqoreColumn>
      {args.multipleColumns && (
        <>
          <ReqoreColumn
            {...args}
            style={{ border: '1px solid white', padding: '10px' }}
            flexFlow='column'
          >
            <ReqoreH2>3rd Column</ReqoreH2>
            <ReqoreVerticalSpacer height={20} lineSize='tiny' />
            <ReqoreControlGroup fluid>
              <ReqoreInput placeholder='Filter' />
            </ReqoreControlGroup>
            <ReqoreVerticalSpacer height={10} />
            <ReqoreControlGroup vertical fluid>
              <ReqoreButton description='This is a button'>Button</ReqoreButton>
              <ReqoreButton description='This is a button'>Button</ReqoreButton>
              <ReqoreButton description='This is a button'>Button</ReqoreButton>
              <ReqoreButton description='This is a button'>Button</ReqoreButton>
            </ReqoreControlGroup>
          </ReqoreColumn>
          <ReqoreColumn
            {...args}
            style={{ border: '1px solid white', padding: '10px' }}
            flexFlow='column'
          >
            <ReqoreH2>4th Column</ReqoreH2>
            <ReqoreVerticalSpacer height={20} lineSize='tiny' />
            <ReqoreControlGroup fluid>
              <ReqoreInput placeholder='Filter' />
            </ReqoreControlGroup>
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
export const CustomAlignment = Template.bind({});
CustomAlignment.args = {
  multipleColumns: true,
  alignItems: 'center',
};

export const WithMinimumWidth = Template.bind({});
WithMinimumWidth.args = {
  multipleColumns: true,
  minColumnWidth: '500px',
};
