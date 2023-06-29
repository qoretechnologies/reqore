import { IReqoreTableColumn } from '../components/Table';
import data from './data.json';

export const tableData = data;
export const testColumns = [
  {
    dataId: 'id',
    header: 'ID',
    width: 50,
    align: 'center',
  },
  {
    dataId: 'name',
    header: 'Name',
    columns: [
      { dataId: 'firstName', header: 'First Name', width: 150 },
      { dataId: 'lastName', header: 'Last Name', width: 150 },
    ],
  },
  { dataId: 'address', header: 'Address', width: 300, grow: 2 },
  {
    dataId: 'age',
    header: 'Really long age header',
    width: 50,
    align: 'center',
    intent: 'success',
  },
  { dataId: 'occupation', header: 'Ocuppation', width: 200 },
  { dataId: 'group', header: 'Group', width: 150, intent: 'muted' },
  { dataId: 'date', header: 'Date', width: 150, content: 'time-ago' },
] as IReqoreTableColumn[];

export default {
  columns: [
    {
      dataId: 'id',
      header: 'ID',
      width: 50,
      align: 'center',
    },
    { dataId: 'firstName', header: 'First Name', width: 150 },
    { dataId: 'lastName', header: 'Last Name', width: 150 },
    { dataId: 'address', header: 'Address', width: 300, grow: 2 },
    {
      dataId: 'age',
      header: 'Really long age header',
      width: 50,
      align: 'center',
      intent: 'success',
    },
    { dataId: 'occupation', header: 'Ocuppation', width: 200 },
    { dataId: 'group', header: 'Group', width: 150, intent: 'muted' },
    { dataId: 'date', header: 'Date', width: 150, content: 'time-ago' },
  ] as IReqoreTableColumn[],
  data: data.map((datum) => ({
    ...datum,
    date: Date.now(),
  })),
  height: 300,
};
