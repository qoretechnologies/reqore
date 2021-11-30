import shortid from 'shortid';
import { IReqoreTableColumn, IReqoreTableData } from '../components/Table';

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
  data: [...new Array(100)].map((_val, index) => ({
    id: index,
    firstName: shortid.generate(),
    lastName: shortid.generate(),
    address: `${shortid.generate()}, ${shortid.generate()}, ${shortid.generate()}`,
    age: 99 - index,
    occupation: shortid.generate(),
    group: shortid.generate(),
    date: Date.now(),
    _intent: index === 2 || index === 3 || index === 4 ? 'info' : undefined,
    _selectId: index !== 3 && index !== 6 ? `Row-${index}` : null,
    _disabled: index === 5,
  })) as IReqoreTableData,
  height: 300,
};
