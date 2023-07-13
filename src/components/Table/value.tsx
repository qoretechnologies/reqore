import ReqoreIcon from '../Icon';
import { ReqoreP } from '../Paragraph';

export interface IReqoreTableValueProps {
  value?: string | number | boolean | any[] | { [key: string]: any };
}

export const ReqoreTableValue = ({ value }: IReqoreTableValueProps) => {
  if (value === undefined || value === null) {
    return <>-</>;
  }

  switch (typeof value) {
    case 'string':
    case 'number':
      return <ReqoreP className='reqore-table-text'>{value}</ReqoreP>;
    case 'boolean':
      return (
        <ReqoreIcon
          icon={value ? 'CheckLine' : 'CloseLine'}
          intent={value ? 'success' : 'danger'}
        />
      );
    default:
      return <ReqoreP className='reqore-table-text'>{JSON.stringify(value)}</ReqoreP>;
  }
};
