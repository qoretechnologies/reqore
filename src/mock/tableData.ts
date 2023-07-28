import { IReqoreTableProps } from '../components/Table';
import data from './data.json';

export type TestTableItem = {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  age: number;
  occupation: string;
  group: string;
  _selectId: number;
  _disabled: boolean;
};

export const tableData = data;
export const testColumns: IReqoreTableProps['columns'] = [
  {
    dataId: 'id',
    header: { label: 'ID' },
    width: 50,
    align: 'center',
  },
  {
    dataId: 'name',
    header: {
      label: 'Name',
      columns: [
        { dataId: 'firstName', header: { label: 'First Name' }, width: 150 },
        { dataId: 'lastName', header: { label: 'Last Name' }, width: 150 },
      ],
    },
  },
  { dataId: 'address', header: { label: 'Address' }, width: 300, grow: 2 },
  {
    dataId: 'age',
    header: { label: 'Really long age header' },
    width: 50,
    align: 'center',
    cell: {
      intent: 'success',
    },
  },
  {
    dataId: 'data',
    header: {
      label: 'Data',
      columns: [
        { dataId: 'occupation', header: { label: 'Ocuppation' }, width: 200 },
        { dataId: 'group', header: { label: 'Group' }, width: 150, intent: 'muted' },
      ],
    },
  },
  { dataId: 'date', header: { label: 'Date' }, width: 150, cell: { content: 'time-ago' } },
];

export default {
  columns: testColumns,
  data: data.map((datum) => ({
    ...datum,
    date: Date.now(),
  })),
  height: 300,
};
