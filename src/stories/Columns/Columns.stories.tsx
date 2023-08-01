import { StoryObj } from '@storybook/react';
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
import { StoryMeta } from '../utils';
import { argManager } from '../utils/args';

export interface IColumnsStoryArgs extends IReqoreColumnsProps {
  multipleColumns?: boolean;
}

const { createArg, disableArgs } = argManager<IColumnsStoryArgs>();

const meta = {
  title: 'Layout/Columns/Stories',
  component: ReqoreColumns,
  argTypes: {
    ...createArg('minColumnWidth', {
      defaultValue: '200px',
    }),
    ...createArg('maxColumnWidth', {
      defaultValue: '300px',
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
  args: {
    minColumnWidth: '200px',
    maxColumnWidth: '300px',
    alignItems: 'normal',
  },
} as StoryMeta<typeof ReqoreColumns>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template = (args) => {
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

export const Basic: Story = {
  render: Template,
};

export const MultipleColumns: Story = {
  render: Template,

  args: {
    multipleColumns: true,
  },
};

export const CustomAlignment: Story = {
  render: Template,

  args: {
    multipleColumns: true,
    alignItems: 'center',
  },
};

export const WithMinimumWidth = {
  render: Template,

  args: {
    multipleColumns: true,
    minColumnWidth: '500px',
  },
};
