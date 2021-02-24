import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import { IReqoreTableColumn } from '../../components/Table';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreTable,
  ReqoreUIProvider,
} from '../../index';
import tableData from '../../mock/tableData';

export default {
  title: 'ReQore/Table',
  args: {
    theme: {
      main: '#ffffff',
    },
    table: tableData,
  },
} as Meta;

const Template: Story<
  IReqoreUIProviderProps & {
    table: { columns: IReqoreTableColumn[]; data: any[] };
  }
> = ({ theme, table }) => {
  return (
    <ReqoreUIProvider theme={theme}>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTable {...table} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

export const Basic = Template.bind({});
export const WithDarkColor = Template.bind({});
WithDarkColor.args = {
  theme: {
    main: '#222222',
  },
};
export const HorizontalScroll = Template.bind({});
HorizontalScroll.args = {
  theme: {
    main: '#222222',
  },
  table: {
    ...tableData,
    width: 500,
  },
};
export const Striped = Template.bind({});
Striped.args = {
  theme: {
    main: '#222222',
  },
  table: {
    ...tableData,
    striped: true,
  },
};
export const WithGroupedColumns = Template.bind({});
WithGroupedColumns.args = {
  table: {
    ...tableData,
    columns: [
      {
        dataId: 'id',
        header: 'ID',
        width: 50,
        align: 'center',
      },
      {
        header: 'Name',
        dataId: 'name',
        grow: 3,
        columns: [
          { dataId: 'firstName', header: 'First Name', width: 150, grow: 2 },
          { dataId: 'lastName', header: 'Last Name', width: 150, grow: 1 },
        ],
      },
      { dataId: 'address', header: 'Address', width: 300, grow: 2 },
      {
        dataId: 'age',
        header: 'Really long age header',
        width: 50,
        align: 'center',
      },
      { dataId: 'occupation', header: 'Ocuppation', width: 200 },
      { dataId: 'group', header: 'Group', width: 150 },
    ] as IReqoreTableColumn[],
  },
};

export const Sortable = Template.bind({});
Sortable.args = {
  theme: {
    main: '#194d5d',
  },
  table: {
    ...tableData,
    columns: [
      {
        dataId: 'id',
        header: 'ID',
        width: 50,
        align: 'center',
        sortable: true,
      },
      { dataId: 'firstName', header: 'First Name', width: 150, grow: 2 },
      { dataId: 'lastName', header: 'Last Name', width: 150, grow: 1 },
      { dataId: 'address', header: 'Address', width: 300, grow: 2 },
      {
        dataId: 'age',
        header: 'Really long age header',
        width: 50,
        align: 'center',
        sortable: true,
      },
      { dataId: 'occupation', header: 'Ocuppation', width: 200 },
      { dataId: 'group', header: 'Group', width: 150 },
    ] as IReqoreTableColumn[],
    sort: { by: 'age', direction: 'desc' },
  },
};

export const Complete = Template.bind({});
Complete.args = {
  theme: {
    main: '#194d5d',
  },
  table: {
    ...tableData,
    columns: [
      {
        dataId: 'id',
        header: 'ID',
        width: 50,
        align: 'center',
        sortable: true,
      },
      {
        header: 'Name',
        dataId: 'name',
        grow: 3,
        columns: [
          {
            icon: 'label',
            dataId: 'firstName',
            header: 'First Name',
            width: 150,
            grow: 2,
          },
          {
            icon: 'label',
            dataId: 'lastName',
            header: 'Last Name',
            width: 150,
            grow: 1,
            sortable: true,
          },
        ],
      },
      {
        dataId: 'address',
        header: 'Address',
        width: 300,
        grow: 2,
        onClick: () => alert('clicked address'),
      },
      {
        icon: 'numerical',
        dataId: 'age',
        header: 'Really long age header',
        width: 50,
        align: 'center',
        sortable: true,
      },
      {
        header: 'Data',
        dataId: 'data',
        columns: [
          { dataId: 'occupation', header: 'Ocuppation', width: 200 },
          { dataId: 'group', header: 'Group', width: 150 },
        ],
      },
    ] as IReqoreTableColumn[],
    sort: { by: 'age', direction: 'desc' },
    striped: true,
  },
};
